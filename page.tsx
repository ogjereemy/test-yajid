"use client";

import "./styles.css";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ChevronDown,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  Star,
  Home,
  Shield,
  Zap,
  Users,
  Award,
  TrendingUp,
  Clock,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import MainHeader from "@/components/MainHeader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Role } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const residentialSubcategories = [
  { value: "apartment", labelEn: "Apartment", labelAr: "شقة" },
  { value: "townhouse", labelEn: "Townhouse", labelAr: "تاون هاوس" },
  { value: "villa", labelEn: "Villa", labelAr: "فيلا" },
  { value: "villa-compound", labelEn: "Villa Compound", labelAr: "مجمع فيلا" },
  { value: "land", labelEn: "Land", labelAr: "أرض" },
  { value: "building", labelEn: "Building", labelAr: "مبنى" },
  { value: "penthouse", labelEn: "Penthouse", labelAr: "بنتهاوس" },
  { value: "hotel-apartment", labelEn: "Hotel Apartment", labelAr: "شقة فندقية" },
  { value: "floor", labelEn: "Floor", labelAr: "طابق" },
];

const commercialSubcategories = [
  { value: "office", labelEn: "Office", labelAr: "مكتب" },
  { value: "shop", labelEn: "Shop", labelAr: "محل" },
  { value: "warehouse", labelEn: "Warehouse", labelAr: "مستودع" },
  { value: "labour-camp", labelEn: "Labour Camp", labelAr: "مخيم عمال" },
  { value: "commercial-villa", labelEn: "Commercial Villa", labelAr: "فيلا تجارية" },
  { value: "bulk-unit", labelEn: "Bulk Unit", labelAr: "وحدة بالجملة" },
  { value: "commercial-land", labelEn: "Commercial Land", labelAr: "أرض تجارية" },
  { value: "commercial-floor", labelEn: "Commercial Floor", labelAr: "طابق تجاري" },
  { value: "commercial-building", labelEn: "Commercial Building", labelAr: "مبنى تجاري" },
  { value: "factory", labelEn: "Factory", labelAr: "مصنع" },
  { value: "industrial-land", labelEn: "Industrial Land", labelAr: "أرض صناعية" },
  { value: "mixed-use-land", labelEn: "Mixed Use Land", labelAr: "أرض متعددة الاستخدامات" },
  { value: "showroom", labelEn: "Showroom", labelAr: "صالة عرض" },
  { value: "other-commercial", labelEn: "Other Commercial", labelAr: "تجاري آخر" },
];

// Interfaces
interface ApiProperty {
  id: number;
  title?: string;
  location?: string;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  propertyArea?: number;
  image?: string[];
  status?: string;
}

interface Listing {
  id: number;
  title: string;
  type: string;
  price: number | string;
  location: string;
  bedrooms: number;
  area: number;
  featured: boolean;
  createdAt: string;
  bathrooms?: number;
  image?: string;
  status?: string;
}

interface AdvancedFilters {
  amenities: string[];
  completionStatus: string;
  minArea?: number;
  maxArea?: number;
  rentFrequency?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  sortBy?: string;
  sortOrder?: string;
}

interface MapboxSuggestion {
  placeId: string;
  address: string;
  coordinates: { lon: number; lat: number };
}

function Modal({
  isOpen,
  onClose,
  children,
  title,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  className?: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={clsx("modal", className)} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

interface DropdownItem {
  label?: string | React.ReactNode;
  onClick?: () => void;
  type?: "section" | "divider" | "button";
}

function Dropdown({ label, items, className }: { label: string; items: DropdownItem[]; className?: string; }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={clsx("dropdown", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="dropdown-toggle" aria-expanded={isOpen}>
        {label} <ChevronDown />
      </button>
      {isOpen && (
        <div className="dropdownContent">
          {items.map((item, idx) => {
            if (item.type === "section")
              return (
                <div key={idx} className="dropdown-section">
                  {item.label}
                </div>
              );
            if (item.type === "divider")
              return <hr key={idx} className="dropdown-divider" />;
            return (
              <button
                key={idx}
                className={item.type === "button" ? "dropdown-button" : "dropdownLink"}
                onClick={() => {
                  if (item.onClick) item.onClick();
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Toast({
  message,
  type,
  onClose,
  language,
}: {
  message: string | null;
  type: "success" | "error";
  onClose: () => void;
  language: "en" | "ar";
}) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 8000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`toast toast-${type} ${language === "ar" ? "rtl" : ""}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="toast-content">
        <div className="toast-icon">
          {type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        </div>
        <span className="toast-message">{message}</span>
        <button
          onClick={onClose}
          className="toast-close"
          aria-label={language === "en" ? "Close notification" : "إغلاق الإشعار"}
        >
          ×
        </button>
      </div>
      <div className="toast-progress" />
    </div>
  );
}

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = React.use(params);
  const router = useRouter();
  const { login, register, user, logout, isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [language, setLanguage] = useState<"en" | "ar">(locale === "ar" ? "ar" : "en");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isAgentLoginAttempt, setIsAgentLoginAttempt] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<"buy" | "rent">("buy");
  const [location, setLocation] = useState<string>("");
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [bedrooms, setBedrooms] = useState<string[]>([]);
  const [baths, setBaths] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [category, setCategory] = useState<string>("residential");
  const [subCategory, setSubCategory] = useState<string[]>([]);
  const [propertyStatus, setPropertyStatus] = useState<string>("all");
  const [rentFrequency, setRentFrequency] = useState<string>("yearly");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    amenities: [],
    completionStatus: "all",
    minArea: undefined,
    maxArea: undefined,
    sortBy: "date",
    sortOrder: "DESC",
  });
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [showFullList, setShowFullList] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("AED");
  const [isAreaUnitModalOpen, setIsAreaUnitModalOpen] = useState(false);
  const [selectedAreaUnit, setSelectedAreaUnit] = useState("sqft");
  const [hasSearched, setHasSearched] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const AGENT_ROLES = useMemo(() => [
    Role.AGENT,
    Role.AGENT_MEMBER,
    Role.AGENT_FINANCE,
    Role.AGENCY_ADMIN,
    Role.BOSS,
    Role.PF_CUSTOMER_SERVICE,
    Role.PF_MANAGER,
    Role.ADMIN,
  ], []);

  const handleAgentPortalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAgentLoginAttempt(true);
      setIsSignInOpen(true);
      setError(
        language === "en"
          ? "Please log in to access the Agent Portal."
          : "يرجى تسجيل الدخول للوصول إلى بوابة الوكيل."
      );
      return;
    }
    router.push(`/${language}/agent-dashboard`);
  };

  const cleanAddress = (address: string): string => {
    let parts = address.split(", ");
    if (parts[parts.length - 1] === "United Arab Emirates") {
      parts = parts.slice(0, -1);
    }
    parts = parts.filter((item, index) => index === 0 || item !== parts[index - 1]);
    return parts.join(", ");
  };

  const buildQueryParams = useCallback((currentPropertyStatus: string) => {
    const queryParams = new URLSearchParams();
    queryParams.set("purpose", purpose);
    if (location) queryParams.set("location", location);
    if (priceMin) queryParams.set("priceMin", priceMin);
    if (priceMax) queryParams.set("priceMax", priceMax);
    if (bedrooms.length > 0) queryParams.set("bedrooms", bedrooms.join(","));
    if (baths.length > 0) queryParams.set("bathrooms", baths.join(","));
    if (subCategory.length > 0) queryParams.set("subCategory", subCategory.join(","));
    if (currentPropertyStatus !== "all") queryParams.set("propertyStatus", currentPropertyStatus);
    if (advancedFilters.amenities.length > 0) queryParams.set("amenities", advancedFilters.amenities.join(","));
    if (advancedFilters.minArea) queryParams.set("areaMin", advancedFilters.minArea.toString());
    if (advancedFilters.maxArea) queryParams.set("areaMax", advancedFilters.maxArea.toString());
    if (purpose === "rent" && rentFrequency) queryParams.set("rentFrequency", rentFrequency);
    if (category) queryParams.set("category", category);
    if (advancedFilters.lat) queryParams.set("lat", advancedFilters.lat.toString());
    if (advancedFilters.lng) queryParams.set("lng", advancedFilters.lng.toString());
    if (advancedFilters.radius) queryParams.set("radius", advancedFilters.radius.toString());
    if (advancedFilters.sortBy) queryParams.set("sortBy", advancedFilters.sortBy);
    if (advancedFilters.sortOrder) queryParams.set("sortOrder", advancedFilters.sortOrder);
    return queryParams.toString();
  }, [purpose, location, priceMin, priceMax, bedrooms, baths, subCategory, rentFrequency, advancedFilters, category]);

  const { data: properties = [], error: propertiesError, isLoading: isLoadingProperties } = useQuery<Listing[], Error>({
    queryKey: ["properties", { purpose, location, bedrooms, baths, priceMin, priceMax, category, subCategory, propertyStatus, advancedFilters }],
    queryFn: async () => {
      const queryParams = buildQueryParams(propertyStatus);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const url = `${process.env.NEXT_PUBLIC_API_URL}/properties/search?${queryParams}`;
      const response = await fetch(url, { headers });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to fetch properties (Status: ${response.status})`);
      }
      const data = await response.json();
      return data.map((property: ApiProperty) => ({
        id: property.id,
        title: property.title || "AED 1,200,000",
        location: property.location || "Business Bay, Dubai",
        type: property.type || "Apartment",
        price: property.title || "AED 1,200,000",
        status: property.status || "For Sale",
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        area: property.propertyArea || 720,
        featured: true,
        createdAt: new Date().toISOString(),
        image: property.image?.[0] && (property.image[0].startsWith("/") || property.image[0].startsWith("http")) ? property.image[0] : "/placeholder.svg?height=300&width=400",
      }));
    },
  });

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (!location || location.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/properties/search-address?query=${encodeURIComponent(location)}&lon=55.2708&lat=25.2048`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (!response.ok) throw new Error("Failed to fetch address suggestions");
        const data: MapboxSuggestion[] = await response.json();
        setSuggestions(data.slice(0, 5));
      } catch (err) {
        console.error("Mapbox suggestion error:", err);
        setError(language === "en" ? "Failed to fetch address suggestions" : "فشل في جلب اقتراحات العناوين");
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [location, language]);

  useEffect(() => {
    if (hasSearched && !isLoadingProperties) {
      if (properties.length === 1) {
        setSuccessMessage(
          language === "en"
            ? "Found one property. Redirecting to details..."
            : "تم العثور على عقار واحد. يتم إعادة التوجيه إلى التفاصيل..."
        );
        router.push(`/${language}/customer-page/property/${properties[0].id}`);
      } else {
        setSuccessMessage(
          language === "en"
            ? `Found ${properties.length} properties. Redirecting to list...`
            : `تم العثور على ${properties.length} عقارات. يتم إعادة التوجيه إلى القائمة...`
        );
        router.push(`/${language}/customer-page/properties?${buildQueryParams(propertyStatus)}`);
      }
      setHasSearched(false);
    }
  }, [properties, hasSearched, isLoadingProperties, language, router, buildQueryParams, propertyStatus]);

  useEffect(() => {
    if (user && !isAuthLoading) {
      const hasAgentRole = user.roles?.some((userRole) => AGENT_ROLES.includes(userRole.name as Role));

      if (isAgentLoginAttempt) {
        if (hasAgentRole) {
          setError(null);
          setIsAgentLoginAttempt(false);
          router.push(`/${language}/agent-dashboard`);
          return;
        } else {
          setIsAgentLoginAttempt(false);
        }
      } else if (hasAgentRole) {
        router.push(`/${language}/agent-dashboard`);
      }
    }
  }, [user, isAuthLoading, router, language, AGENT_ROLES, isAgentLoginAttempt]);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(emailOrPhone, password);
      setIsSignInOpen(false);
      setSuccessMessage(language === "en" ? "Login successful!" : "تم تسجيل الدخول بنجاح!");
    } catch {
      setError(language === "en" ? "Login failed. Please try again." : "فشل تسجيل الدخول. حاول مرة أخرى.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(language === "en" ? "Passwords do not match." : "كلمات المرور غير متطابقة.");
      return;
    }
    try {
      await register(name, emailOrPhone, phone, password);
      setIsRegisterOpen(false);
      if (user && user.roles?.some((userRole) => AGENT_ROLES.includes(userRole.name as Role))) {
        router.push(`/${language}/agent-dashboard`);
      } else {
        router.push(`/${language}/customer-page`);
      }
    } catch {
      setError(language === "en" ? "Registration failed. Please try again." : "فشل التسجيل. حاول مرة أخرى.");
    }
  };

  const handleSuggestionClick = (suggestion: MapboxSuggestion) => {
    const cleaned = cleanAddress(suggestion.address);
    setLocation(cleaned);
    setSuggestions([]);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSearch = () => {
    setHasSearched(true);
  };

  const handleSaveSearch = async () => {
    if (!user) {
      setError(language === "en" ? "Please log in to save your search." : "يرجى تسجيل الدخول لحفظ البحث.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError(language === "en" ? "You must be logged in to save searches." : "يجب تسجيل الدخول لحفظ عمليات البحث.");
        return;
      }
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saved-searches`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          userId: user!.id,
          filters: {
            purpose,
            location,
            priceMin,
            priceMax,
            bedrooms,
            baths,
            subCategory: subCategory.join(","),
            propertyStatus,
            ...advancedFilters,
          },
        }),
      });
      setSuccessMessage(language === "en" ? "Search saved successfully!" : "تم حفظ البحث بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["savedSearchesCount"] });
    } catch {
      setError(language === "en" ? "Failed to save search." : "فشل في حفظ البحث.");
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push(`/${language}`);
  };

  const resetSubCategory = () => setSubCategory([]);
  const resetBedsBaths = () => {
    setBedrooms([]);
    setBaths([]);
  };

  const handleSubcategoryChange = (value: string) => {
    setSubCategory((prev) =>
      (prev || []).includes(value)
        ? (prev || []).filter((item) => item !== value)
        : [...(prev || []), value]
    );
  };

  const getSubcategoryLabel = (item: { labelEn: string; labelAr: string }) =>
    language === "en" ? item.labelEn : item.labelAr;

  const categorySubcategoryItems: DropdownItem[] = [
    {
      type: "section",
      label: (
        <div className="p-4 space-y-4 bg-white rounded-md shadow-lg">
          <Tabs value={category} onValueChange={setCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1.5 bg-gray-100 rounded-lg">
              <TabsTrigger value="residential" className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-gray-500 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                {language === "en" ? "Residential" : "سكني"}
              </TabsTrigger>
              <TabsTrigger value="commercial" className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-gray-500 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                {language === "en" ? "Commercial" : "تجاري"}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="residential" className="mt-4">
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {residentialSubcategories.map((item) => (
                  <label key={item.value} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      value={item.value}
                      checked={(subCategory || []).includes(item.value)}
                      onChange={() => handleSubcategoryChange(item.value)}
                      className="h-4 w-4 text-blue-600 transition-colors duration-200 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>{getSubcategoryLabel(item)}</span>
                  </label>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="commercial" className="mt-4">
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {commercialSubcategories.map((item) => (
                  <label key={item.value} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      value={item.value}
                      checked={(subCategory || []).includes(item.value)}
                      onChange={() => handleSubcategoryChange(item.value)}
                      className="h-4 w-4 text-blue-600 transition-colors duration-200 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>{getSubcategoryLabel(item)}</span>
                  </label>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ),
    },
    { type: "divider" },
    {
      type: "button",
      label: language === "en" ? "Reset Subcategory" : "إعادة تعيين الفئة الفرعية",
      onClick: resetSubCategory,
    },
  ];

  const priceRangeItems: DropdownItem[] = [
    {
      type: "section",
      label: (
        <div className="flex flex-col space-y-4 p-4 bg-white rounded-md shadow-lg">
          <Input
            type="number"
            placeholder={language === "en" ? "Min Price" : "أدنى سعر"}
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
            aria-label={language === "en" ? "Minimum Price" : "أدنى سعر"}
          />
          <Input
            type="number"
            placeholder={language === "en" ? "Max Price" : "أقصى سعر"}
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
            aria-label={language === "en" ? "Maximum Price" : "أقصى سعر"}
          />
          <Button
            onClick={() => {
              setPriceMin("");
              setPriceMax("");
            }}
            variant="outline"
            className="w-full mt-2 font-semibold text-gray-700 border-gray-300 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
            aria-label={language === "en" ? "Reset Price" : "إعادة تعيين السعر"}
          >
            {language === "en" ? "Reset" : "إعادة تعيين"}
          </Button>
        </div>
      ),
    },
  ];

  const areaItems: DropdownItem[] = [
    {
      type: "section",
      label: (
        <div className="flex flex-col space-y-4 p-4 bg-white rounded-md shadow-lg">
          <Input
            type="number"
            placeholder={language === "en" ? "Minimum sqft" : "أدنى قدم مربع"}
            value={advancedFilters.minArea || ""}
            onChange={(e) =>
              setAdvancedFilters((prev) => ({
                ...prev,
                minArea: Number(e.target.value),
              }))
            }
            className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
            aria-label={language === "en" ? "Minimum sqft" : "أدنى قدم مربع"}
          />
          <Input
            type="number"
            placeholder={language === "en" ? "Maximum sqft" : "أقصى قدم مربع"}
            value={advancedFilters.maxArea || ""}
            onChange={(e) =>
              setAdvancedFilters((prev) => ({
                ...prev,
                maxArea: Number(e.target.value),
              }))
            }
            className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
            aria-label={language === "en" ? "Maximum sqft" : "أقصى قدم مربع"}
          />
          <Button
            onClick={() => {
              setAdvancedFilters((prev) => ({
                ...prev,
                minArea: undefined,
                maxArea: undefined,
              }));
            }}
            variant="outline"
            className="w-full mt-2 font-semibold text-gray-700 border-gray-300 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
            aria-label={language === "en" ? "Reset" : "إعادة تعيين"}
          >
            {language === "en" ? "Reset" : "إعادة تعيين"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={language === "ar" ? "rtl" : ""}>
      <MainHeader
        language={language}
        setLanguage={setLanguage}
        user={user}
        isAuthLoading={isAuthLoading}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        setIsSignInOpen={setIsSignInOpen}
        setIsRegisterOpen={setIsRegisterOpen}
        handleLogout={handleLogout}
        handleAgentPortalClick={handleAgentPortalClick}
        setIsCurrencyModalOpen={setIsCurrencyModalOpen}
        setIsAreaUnitModalOpen={setIsAreaUnitModalOpen}
      />

      {/* Modals */}
      <Modal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} title={language === "en" ? "Sign In" : "تسجيل الدخول"}>
        {error && <p className="error-message">{error}</p>}
        <div>
          <div className="form-group">
            <label>{language === "en" ? "Email or Phone" : "البريد الإلكتروني أو الهاتف"}</label>
            <div className="input-with-icon">
              <Mail />
              <Input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={language === "en" ? "Enter your email or phone" : "أدخل بريدك الإلكتروني أو هاتفك"}
                required
                aria-label={language === "en" ? "Email or Phone" : "البريد الإلكتروني أو الهاتف"}
              />
            </div>
          </div>
          <div className="form-group">
            <label>{language === "en" ? "Password" : "كلمة المرور"}</label>
            <div className="input-with-icon">
              <Lock />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === "en" ? "Enter your password" : "أدخل كلمة المرور"}
                required
                aria-label={language === "en" ? "Password" : "كلمة المرور"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password password-icon"
                aria-label={language === "en" ? "Toggle password visibility" : "تبديل رؤية كلمة المرور"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          <Button onClick={handleSignInSubmit} className="submit-button">
            {language === "en" ? "Sign In" : "تسجيل الدخول"}
          </Button>
          <div className="divider">
            <span>{language === "en" ? "OR" : "أو"}</span>
          </div>
          <Button variant="outline" className="google-signin-button">
            <svg className="google-icon" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {language === "en" ? "Continue with Google" : "متابعة باستخدام جوجل"}
          </Button>
        </div>
        <p className="switch-link">
          {language === "en" ? "Don't have an account?" : "ليس لديك حساب؟"}
          <a href="#" onClick={(e) => { e.preventDefault(); setIsSignInOpen(false); setIsRegisterOpen(true); }}>
            {language === "en" ? "Register" : "تسجيل"}
          </a>
        </p>
      </Modal>

      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title={language === "en" ? "Register" : "تسجيل"}>
        {error && <p className="error-message">{error}</p>}
        <div>
          <div className="form-group">
            <label>{language === "en" ? "Name" : "الاسم"}</label>
            <div className="input-with-icon">
              <User />
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === "en" ? "Enter your name" : "أدخل اسمك"}
                required
                aria-label={language === "en" ? "Name" : "الاسم"}
              />
            </div>
          </div>
          <div className="form-group">
            <label>{language === "en" ? "Email" : "البريد الإلكتروني"}</label>
            <div className="input-with-icon">
              <Mail />
              <Input
                type="email"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={language === "en" ? "Enter your email" : "أدخل بريدك الإلكتروني"}
                required
                aria-label={language === "en" ? "Email" : "البريد الإلكتروني"}
              />
            </div>
          </div>
          <div className="form-group">
            <label>{language === "en" ? "Phone" : "الهاتف"}</label>
            <div className="input-with-icon">
              <Phone />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={language === "en" ? "Enter your phone" : "أدخل هاتفك"}
                required
                aria-label={language === "en" ? "Phone" : "الهاتف"}
              />
            </div>
          </div>
          <div className="form-group">
            <label>{language === "en" ? "Password" : "كلمة المرور"}</label>
            <div className="input-with-icon">
              <Lock />
              <Input
                type={showRegisterPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === "en" ? "Enter your password" : "أدخل كلمة المرور"}
                required
                aria-label={language === "en" ? "Password" : "كلمة المرور"}
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                className="toggle-password password-icon"
                aria-label={language === "en" ? "Toggle password visibility" : "تبديل رؤية كلمة المرور"}
              >
                {showRegisterPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>{language === "en" ? "Confirm Password" : "تأكيد كلمة المرور"}</label>
            <div className="input-with-icon">
              <Lock />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={language === "en" ? "Confirm your password" : "تأكيد كلمة المرور"}
                required
                aria-label={language === "en" ? "Confirm Password" : "تأكيد كلمة المرور"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="toggle-password password-icon"
                aria-label={language === "en" ? "Toggle confirm password visibility" : "تبديل رؤية تأكيد كلمة المرور"}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          <Button onClick={handleRegisterSubmit} className="submit-button">
            {language === "en" ? "Register" : "تسجيل"}
          </Button>
          <div className="divider">
            <span>{language === "en" ? "OR" : "أو"}</span>
          </div>
          <Button variant="outline" className="google-signin-button">
            <svg className="google-icon" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {language === "en" ? "Continue with Google" : "متابعة باستخدام جوجل"}
          </Button>
        </div>
        <p className="switch-link">
          {language === "en" ? "Already have an account?" : "هل لديك حساب؟"}
          <a href="#" onClick={(e) => { e.preventDefault(); setIsRegisterOpen(false); setIsSignInOpen(true); }}>
            {language === "en" ? "Sign In" : "تسجيل الدخول"}
          </a>
        </p>
      </Modal>

      <Toast message={successMessage} type="success" onClose={() => setSuccessMessage(null)} language={language} />
      <Toast message={error} type="error" onClose={() => setError(null)} language={language} />

      <Modal isOpen={isCurrencyModalOpen} onClose={() => setIsCurrencyModalOpen(false)} title={language === "en" ? "Change Currency" : "تغيير العملة"}>
        <div className="flex flex-col space-y-2">
          {[
            { code: "AED", name: "United Arab Emirates (AED)" },
            { code: "EUR", name: "European Union (EUR)" },
            { code: "GBP", name: "United Kingdom (GBP)" },
            { code: "INR", name: "India (INR)" },
            { code: "PKR", name: "Pakistan (PKR)" },
            { code: "RUB", name: "Russian Federation (RUB)" },
            { code: "SAR", name: "Saudi Arabia (SAR)" },
            { code: "USD", name: "United States of America (USD)" },
            { code: "CNY", name: "Chinese Yuan (CNY)" },
          ].map((currencyOption) => (
            <Button
              key={currencyOption.code}
              variant={selectedCurrency === currencyOption.code ? "default" : "outline"}
              onClick={() => {
                setSelectedCurrency(currencyOption.code);
                setIsCurrencyModalOpen(false);
              }}
            >
              {currencyOption.name}
            </Button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={isAreaUnitModalOpen} onClose={() => setIsAreaUnitModalOpen(false)} title={language === "en" ? "Change Area Unit" : "تغيير وحدة المساحة"}>
        <div className="flex flex-col space-y-2">
          <select
            value={selectedAreaUnit}
            onChange={(e) => {
              setSelectedAreaUnit(e.target.value);
              setIsAreaUnitModalOpen(false);
            }}
            className="p-2 border rounded"
          >
            <option value="sqft">{language === "en" ? "Square Feet" : "قدم مربع"}</option>
            <option value="sqyd">{language === "en" ? "Square Yards" : "ياردة مربعة"}</option>
            <option value="sqm">{language === "en" ? "Square Meters" : "متر مربع"}</option>
          </select>
        </div>
      </Modal>

      <main>
        {/* Enhanced Hero Section */}
        <section className="relative flex items-center justify-center min-h-screen overflow-hidden text-white bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" dir={language === "en" ? "ltr" : "rtl"}>
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
            <motion.div
              className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
              animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
              animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          <div className="relative z-10 w-full max-w-7xl px-4 mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-6xl md:text-8xl font-black tracking-tight mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                {language === "en" ? "Find Your Dream Home" : "ابحث عن منزل أحلامك"}
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {language === "en"
                  ? "Discover premium properties in the UAE with advanced search, verified listings, and expert guidance."
                  : "اكتشف العقارات المميزة في دولة الإمارات العربية المتحدة مع البحث المتقدم والقوائم المعتمدة والإرشاد الخبير."}
              </motion.p>
            </motion.div>

            <motion.div
              className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Tabs defaultValue="properties" className="space-y-8">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-gray-100 p-2 rounded-xl h-auto">
                  <TabsTrigger value="properties" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6 py-3 font-semibold transition-all duration-200">
                    {language === "en" ? "Properties" : "عقارات"}
                  </TabsTrigger>
                  <TabsTrigger value="new-projects" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6 py-3 font-semibold transition-all duration-200">
                    {language === "en" ? "New Projects" : "مشاريع جديدة"}
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6 py-3 font-semibold transition-all duration-200">
                    {language === "en" ? "Transactions" : "معاملات"}
                  </TabsTrigger>
                  <TabsTrigger value="truestimate" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6 py-3 font-semibold transition-all duration-200">
                    {language === "en" ? "TruEstimate™" : "TruEstimate™"}
                  </TabsTrigger>
                  <TabsTrigger value="agents" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6 py-3 font-semibold transition-all duration-200">
                    {language === "en" ? "Agents" : "وكلاء"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="properties" className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr,auto] gap-6 items-center">
                    <Tabs value={purpose} onValueChange={(value) => setPurpose(value as "buy" | "rent")} className="w-full lg:w-auto">
                      <TabsList className="flex w-full gap-2 bg-gray-100 p-2 rounded-xl h-auto">
                        <TabsTrigger value="buy" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-8 py-3 font-semibold transition-all duration-200">
                          {language === "en" ? "Buy" : "شراء"}
                        </TabsTrigger>
                        <TabsTrigger value="rent" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-8 py-3 font-semibold transition-all duration-200">
                          {language === "en" ? "Rent" : "إيجار"}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="relative flex-1">
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder={language === "en" ? "Enter location (e.g., Dubai Marina, Business Bay)" : "أدخل الموقع (مثل دبي مارينا، الخليج التجاري)"}
                          className="w-full pl-12 pr-4 py-4 text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                          autoComplete="off"
                          aria-label={language === "en" ? "Search by location" : "البحث حسب الموقع"}
                        />
                      </div>
                      {suggestions.length > 0 && (
                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                          {suggestions.map((suggestion) => (
                            <div
                              key={suggestion.placeId}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="flex items-center gap-3 p-4 text-gray-700 hover:bg-blue-50 transition-colors duration-200 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                              <span className="text-sm">{cleanAddress(suggestion.address)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleSearch}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                      aria-label={language === "en" ? "Search properties" : "بحث عن العقارات"}
                    >
                      <Search size={24} className="mr-2" />
                      {language === "en" ? "Search" : "بحث"}
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {purpose === "buy" && (
                      <Tabs value={propertyStatus} onValueChange={(value) => setPropertyStatus(value)} className="w-full sm:w-auto">
                        <TabsList className="grid w-full grid-cols-3 gap-2 bg-gray-100 p-2 rounded-xl">
                          <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2 font-medium transition-all duration-200">
                            {language === "en" ? "All" : "الكل"}
                          </TabsTrigger>
                          <TabsTrigger value="Ready" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2 font-medium transition-all duration-200">
                            {language === "en" ? "Ready" : "جاهز"}
                          </TabsTrigger>
                          <TabsTrigger value="Off-plan" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2 font-medium transition-all duration-200">
                            {language === "en" ? "Off-plan" : "على الخارطة"}
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    )}

                    {purpose === "rent" && (
                      <Dropdown
                        label={language === "en" ? "Rent Frequency" : "تكرار الإيجار"}
                        items={[
                          { label: language === "en" ? "Yearly" : "سنوي", onClick: () => setRentFrequency("yearly") },
                          { label: language === "en" ? "Monthly" : "شهري", onClick: () => setRentFrequency("monthly") },
                          { label: language === "en" ? "Weekly" : "أسبوعي", onClick: () => setRentFrequency("weekly") },
                          { label: language === "en" ? "Daily" : "يومي", onClick: () => setRentFrequency("daily") },
                          { label: language === "en" ? "Any" : "أي", onClick: () => setRentFrequency("any") },
                        ]}
                      />
                    )}

                    <Dropdown
                      label={language === "en" ? (category === "residential" ? "Residential" : "Commercial") : (category === "residential" ? "سكني" : "تجاري")}
                      items={categorySubcategoryItems}
                    />

                    <Dropdown label={language === "en" ? "Price (AED)" : "السعر (درهم)"} items={priceRangeItems} className="w-full sm:w-auto" />

                    {category === "residential" ? (
                      <Dropdown
                        label={language === "en" ? "Beds & Baths" : "غرف نوم وحمامات"}
                        items={[
                          {
                            type: "section",
                            label: (
                              <div className="flex flex-col p-6 space-y-6 bg-white rounded-xl shadow-lg min-w-[320px]">
                                <div>
                                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                                    {language === "en" ? "Bedrooms" : "غرف نوم"}
                                  </label>
                                  <div className="flex flex-wrap gap-3">
                                    {["studio", "1", "2", "3", "4", "5", "6", "7", "8+"].map((bed) => (
                                      <label key={bed} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={bedrooms.includes(bed)}
                                          onChange={(e) => {
                                            const checked = e.target.checked;
                                            setBedrooms((prev) => checked ? [...prev, bed] : prev.filter((b) => b !== bed));
                                          }}
                                          className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 transition-colors duration-200"
                                        />
                                        <span className="font-medium">
                                          {bed === "studio" ? (language === "en" ? "Studio" : "استوديو") : bed}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                                    {language === "en" ? "Bathrooms" : "حمامات"}
                                  </label>
                                  <div className="flex flex-wrap gap-3">
                                    {["1", "2", "3", "4", "5", "6+"].map((bath) => (
                                      <label key={bath} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={baths.includes(bath)}
                                          onChange={(e) => {
                                            const checked = e.target.checked;
                                            setBaths((prev) => checked ? [...prev, bath] : prev.filter((b) => b !== bath));
                                          }}
                                          className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 transition-colors duration-200"
                                        />
                                        <span className="font-medium">{bath}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <Button
                                  onClick={resetBedsBaths}
                                  variant="outline"
                                  className="w-full mt-4 font-semibold border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
                                >
                                  {language === "en" ? "Reset" : "إعادة تعيين"}
                                </Button>
                              </div>
                            ),
                          },
                        ]}
                      />
                    ) : (
                      <Dropdown label={language === "en" ? "Area (sqft)" : "المساحة (قدم مربع)"} items={areaItems} />
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-600 font-medium">
                        {isLoadingProperties
                          ? language === "en" ? "Searching properties..." : "جارٍ البحث عن العقارات..."
                          : propertiesError
                          ? language === "en" ? "Failed to load properties." : "فشل في تحميل العقارات."
                          : language === "en"
                          ? `${properties.length} properties found`
                          : `${properties.length} عقارات تم العثور عليها`}
                      </p>
                      {isLoadingProperties && (
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    {user && (
                      <Button
                        variant="outline"
                        onClick={handleSaveSearch}
                        className="px-6 py-2 font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
                        aria-label={language === "en" ? "Save search" : "حفظ البحث"}
                      >
                        <Heart size={16} className="mr-2" />
                        {language === "en" ? "Save Search" : "حفظ البحث"}
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="new-projects" className="text-center text-gray-600 py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <Home size={48} className="text-blue-500" />
                    <h3 className="text-xl font-semibold">{language === "en" ? "New Projects Coming Soon" : "مشاريع جديدة قريباً"}</h3>
                    <p>{language === "en" ? "Discover upcoming developments and off-plan properties" : "اكتشف التطوير القادم والعقارات على الخارطة"}</p>
                  </div>
                </TabsContent>

                <TabsContent value="transactions" className="text-center text-gray-600 py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <TrendingUp size={48} className="text-blue-500" />
                    <h3 className="text-xl font-semibold">{language === "en" ? "Market Transactions" : "معاملات السوق"}</h3>
                    <p>{language === "en" ? "Access real estate transaction data and market insights" : "الوصول إلى بيانات معاملات العقارات ورؤى السوق"}</p>
                  </div>
                </TabsContent>

                <TabsContent value="truestimate" className="text-center text-gray-600 py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <Award size={48} className="text-blue-500" />
                    <h3 className="text-xl font-semibold">{language === "en" ? "TruEstimate™ Valuation" : "تقييم TruEstimate™"}</h3>
                    <p>{language === "en" ? "Get accurate property valuations powered by AI" : "احصل على تقييمات عقارية دقيقة مدعومة بالذكاء الاصطناعي"}</p>
                  </div>
                </TabsContent>

                <TabsContent value="agents" className="text-center text-gray-600 py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <Users size={48} className="text-blue-500" />
                    <h3 className="text-xl font-semibold">{language === "en" ? "Find Expert Agents" : "ابحث عن الوكلاء الخبراء"}</h3>
                    <p>{language === "en" ? "Connect with verified real estate professionals" : "تواصل مع المهنيين العقاريين المعتمدين"}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" dir={language === "en" ? "ltr" : "rtl"}>
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {language === "en" ? "Why Choose PropertyRight?" : "لماذا تختار بروبرتي رايت؟"}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {language === "en"
                  ? "Experience the future of real estate with our cutting-edge platform designed for modern property seekers."
                  : "اختبر مستقبل العقارات مع منصتنا المتطورة المصممة للباحثين عن العقارات الحديثة."}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield className="w-12 h-12 text-blue-600" />,
                  titleEn: "Verified Listings",
                  titleAr: "قوائم معتمدة",
                  descEn: "Every property is verified by our expert team to ensure authenticity and accuracy.",
                  descAr: "يتم التحقق من كل عقار من قبل فريق الخبراء لدينا لضمان الأصالة والدقة.",
                },
                {
                  icon: <Zap className="w-12 h-12 text-blue-600" />,
                  titleEn: "AI-Powered Search",
                  titleAr: "بحث مدعوم بالذكاء الاصطناعي",
                  descEn: "Find your perfect property faster with our intelligent search algorithms.",
                  descAr: "اعثر على عقارك المثالي بشكل أسرع مع خوارزميات البحث الذكية لدينا.",
                },
                {
                  icon: <Users className="w-12 h-12 text-blue-600" />,
                  titleEn: "Expert Agents",
                  titleAr: "وكلاء خبراء",
                  descEn: "Connect with certified real estate professionals who know the market inside out.",
                  descAr: "تواصل مع المهنيين العقاريين المعتمدين الذين يعرفون السوق من الداخل والخارج.",
                },
                {
                  icon: <Award className="w-12 h-12 text-blue-600" />,
                  titleEn: "Market Analytics",
                  titleAr: "تحليلات السوق",
                  descEn: "Access comprehensive market data and trends to make informed decisions.",
                  descAr: "الوصول إلى بيانات السوق الشاملة والاتجاهات لاتخاذ قرارات مدروسة.",
                },
                {
                  icon: <Clock className="w-12 h-12 text-blue-600" />,
                  titleEn: "24/7 Support",
                  titleAr: "دعم 24/7",
                  descEn: "Our customer support team is available round the clock to assist you.",
                  descAr: "فريق دعم العملاء لدينا متاح على مدار الساعة لمساعدتك.",
                },
                {
                  icon: <TrendingUp className="w-12 h-12 text-blue-600" />,
                  titleEn: "Investment Insights",
                  titleAr: "رؤى الاستثمار",
                  descEn: "Get detailed ROI analysis and investment recommendations for properties.",
                  descAr: "احصل على تحليل مفصل للعائد على الاستثمار وتوصيات الاستثمار للعقارات.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-blue-50 rounded-full">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {language === "en" ? feature.titleEn : feature.titleAr}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {language === "en" ? feature.descEn : feature.descAr}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-20 bg-blue-600 text-white" dir={language === "en" ? "ltr" : "rtl"}>
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {language === "en" ? "Trusted by Thousands" : "موثوق من قبل الآلاف"}
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                {language === "en"
                  ? "Join the growing community of satisfied property buyers, sellers, and renters."
                  : "انضم إلى المجتمع المتنامي من مشتري العقارات والبائعين والمستأجرين الراضين."}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  number: 15000,
                  suffix: "+",
                  labelEn: "Properties Listed",
                  labelAr: "عقارات مدرجة",
                },
                {
                  number: 5000,
                  suffix: "+",
                  labelEn: "Happy Customers",
                  labelAr: "عملاء راضون",
                },
                {
                  number: 200,
                  suffix: "+",
                  labelEn: "Expert Agents",
                  labelAr: "وكلاء خبراء",
                },
                {
                  number: 95,
                  suffix: "%",
                  labelEn: "Customer Satisfaction",
                  labelAr: "رضا العملاء",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-4xl md:text-5xl font-black mb-2">
                    <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                  </div>
                  <p className="text-blue-100 font-semibold">
                    {language === "en" ? stat.labelEn : stat.labelAr}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50" dir={language === "en" ? "ltr" : "rtl"}>
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {language === "en" ? "What Our Clients Say" : "ما يقوله عملاؤنا"}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {language === "en"
                  ? "Real stories from real people who found their dream properties with us."
                  : "قصص حقيقية من أشخاص حقيقيين وجدوا عقاراتهم المثالية معنا."}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  nameEn: "Sarah Johnson",
                  nameAr: "سارة جونسون",
                  roleEn: "Property Buyer",
                  roleAr: "مشتري عقار",
                  testimonialEn: "PropertyRight made finding my dream home incredibly easy. The search filters are amazing and the agent support was exceptional.",
                  testimonialAr: "جعلت بروبرتي رايت العثور على منزل أحلامي سهلاً للغاية. مرشحات البحث مذهلة ودعم الوكيل كان استثنائياً.",
                  rating: 5,
                },
                {
                  nameEn: "Ahmed Al-Rashid",
                  nameAr: "أحمد الراشد",
                  roleEn: "Real Estate Investor",
                  roleAr: "مستثمر عقاري",
                  testimonialEn: "The market analytics and investment insights helped me make profitable decisions. Highly recommend for serious investors.",
                  testimonialAr: "ساعدتني تحليلات السوق ورؤى الاستثمار في اتخاذ قرارات مربحة. أوصي بشدة للمستثمرين الجادين.",
                  rating: 5,
                },
                {
                  nameEn: "Maria Garcia",
                  nameAr: "ماريا غارسيا",
                  roleEn: "First-time Buyer",
                  roleAr: "مشترية لأول مرة",
                  testimonialEn: "As a first-time buyer, I was overwhelmed, but PropertyRight's team guided me through every step. Couldn't be happier!",
                  testimonialAr: "كمشترية لأول مرة، كنت مرتبكة، لكن فريق بروبرتي رايت أرشدني خلال كل خطوة. لا يمكنني أن أكون أكثر سعادة!",
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{language === "en" ? testimonial.testimonialEn : testimonial.testimonialAr}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {language === "en" ? testimonial.nameEn : testimonial.nameAr}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {language === "en" ? testimonial.roleEn : testimonial.roleAr}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white" dir={language === "en" ? "ltr" : "rtl"}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {language === "en" ? "Ready to Find Your Dream Property?" : "مستعد للعثور على عقار أحلامك؟"}
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                {language === "en"
                  ? "Join thousands of satisfied customers who found their perfect homes with PropertyRight."
                  : "انضم إلى آلاف العملاء الراضين الذين وجدوا منازلهم المثالية مع بروبرتي رايت."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
                  onClick={() => setIsRegisterOpen(true)}
                >
                  {language === "en" ? "Get Started Today" : "ابدأ اليوم"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
                  onClick={() => setIsSignInOpen(true)}
                >
                  {language === "en" ? "Sign In" : "تسجيل الدخول"}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white" dir={language === "en" ? "ltr" : "rtl"}>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 lg:col-span-2">
              <h3 className="text-2xl font-bold mb-4">
                {language === "en" ? "PropertyRight" : "بروبرتي رايت"}
              </h3>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                {language === "en"
                  ? "Your trusted partner in finding the perfect property. We make real estate simple, transparent, and accessible for everyone."
                  : "شريكك الموثوق في العثور على العقار المثالي. نجعل العقارات بسيطة وشفافة ومتاحة للجميع."}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">
                {language === "en" ? "Quick Links" : "روابط سريعة"}
              </h4>
              <ul className="space-y-3">
                <li><Link href={`/${language}/buy`} className="text-gray-300 hover:text-white transition-colors">
                  {language === "en" ? "Buy Property" : "شراء عقار"}
                </Link></li>
                <li><Link href={`/${language}/rent`} className="text-gray-300 hover:text-white transition-colors">
                  {language === "en" ? "Rent Property" : "استئجار عقار"}
                </Link></li>
                <li><Link href={`/${language}/new-projects`} className="text-gray-300 hover:text-white transition-colors">
                  {language === "en" ? "New Projects" : "مشاريع جديدة"}
                </Link></li>
                <li><Link href={`/${language}/agents`} className="text-gray-300 hover:text-white transition-colors">
                  {language === "en" ? "Find Agents" : "البحث عن وكلاء"}
                </Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">
                {language === "en" ? "Contact Info" : "معلومات الاتصال"}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <MapPin size={16} className="text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300">{language === "en" ? "Dubai, UAE" : "دبي، الإمارات العربية المتحدة"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300">+971 123 456 789</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300">info@propertyright.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                {language === "en"
                  ? `© ${currentYear} PropertyRight. All rights reserved.`
                  : `© ${currentYear} بروبرتي رايت. كل الحقوق محفوظة.`}
              </p>
              <div className="flex flex-wrap gap-6 text-sm">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  {language === "en" ? "Privacy Policy" : "سياسة الخصوصية"}
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  {language === "en" ? "Terms of Service" : "شروط الخدمة"}
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  {language === "en" ? "Support" : "الدعم"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}