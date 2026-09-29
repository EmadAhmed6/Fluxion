"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  User as UserIcon,
  Search,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Globe,
  Menu,
  X,
  Crown,
  MessageSquare,
} from "lucide-react";
import Cookies from "js-cookie";
import { useGetAuthMeQuery, useLogout } from "@/_features/auth/hooks";
import { useGetAllUsers } from "@/_features/user/hooks";
import { useGetConversations } from "@/_features/chat";
import { Button } from "@/components/ui/button";
import { Text } from "@/_components/Text";
import Tooltip from "@/_components/Tooltip";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import NotificationDropdown from "@/_components/NotificationDropdown";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { language, toggleLanguage, t, isArabic } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDesktopSuggestions, setShowDesktopSuggestions] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const desktopSearchRef = React.useRef<HTMLFormElement | null>(null);
  const mobileSearchRef = React.useRef<HTMLFormElement | null>(null);

  const token = Cookies.get("token");
  const { data: user } = useGetAuthMeQuery();
  const { data: allUsers } = useGetAllUsers();
  const { data: chatConversations } = useGetConversations();

  const totalUnreadMessages = React.useMemo(() => {
    if (!Array.isArray(chatConversations)) return 0;
    return chatConversations.reduce(
      (acc, curr) => acc + (curr.unreadCount || 0),
      0,
    );
  }, [chatConversations]);

  const logout = useLogout();
  const router = useRouter();


  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredUsers = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const usersList = Array.isArray(allUsers) ? allUsers : allUsers?.users || [];
    if (!q || usersList.length === 0) return [];

    const cleanQuery = q.replace(/^@/, "");

    const getRelevance = (u: any) => {
      const cleanUsername = (u.username || "").toLowerCase().replace(/^@/, "");
      const fullName = (u.fullName || "").toLowerCase();
      const words: string[] = fullName.split(/\s+/).filter(Boolean);

      if (cleanUsername.startsWith(cleanQuery)) return 1;
      if (words.length > 0 && words[0].startsWith(cleanQuery)) return 1;

      if (words.slice(1).some((w: string) => w.startsWith(cleanQuery)))
        return 2;

      if (cleanUsername.includes(cleanQuery) || fullName.includes(cleanQuery))
        return 3;

      // No match
      return 0;
    };

    return usersList
      .map((u) => ({ user: u, rank: getRelevance(u) }))
      .filter((item) => item.rank > 0)
      .sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank; // Rank 1 comes before Rank 2
        const nameA = a.user.fullName || a.user.username || "";
        const nameB = b.user.fullName || b.user.username || "";
        return nameA.localeCompare(nameB);
      })
      .map((item) => item.user)
      .slice(0, 6);
  }, [searchQuery, allUsers]);

  // Reset keyboard selection whenever search query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node)
      ) {
        setShowDesktopSuggestions(false);
      }
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowMobileSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedIndex(-1);
    setShowDesktopSuggestions(false);
    setShowMobileSuggestions(false);
  };

  const handleSelectUser = (userId: string) => {
    setShowDesktopSuggestions(false);
    setShowMobileSuggestions(false);
    setSelectedIndex(-1);
    setSearchQuery("");
    setMobileMenuOpen(false);
    router.push(`/profile/${userId}`);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    isMobile: boolean = false,
  ) => {
    if (!filteredUsers || filteredUsers.length === 0) return;

    const showSuggestions = isMobile
      ? showMobileSuggestions
      : showDesktopSuggestions;
    const setShowSuggestions = isMobile
      ? setShowMobileSuggestions
      : setShowDesktopSuggestions;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!showSuggestions) {
        setShowSuggestions(true);
      }
      setSelectedIndex((prev) =>
        prev < filteredUsers.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!showSuggestions) {
        setShowSuggestions(true);
      }
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredUsers.length - 1,
      );
    } else if (e.key === "Escape" || e.key === "Tab") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } else if (e.key === "Enter") {
      if (
        showSuggestions &&
        selectedIndex >= 0 &&
        filteredUsers[selectedIndex]
      ) {
        e.preventDefault();
        handleSelectUser(filteredUsers[selectedIndex]._id);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDesktopSuggestions(false);
    setShowMobileSuggestions(false);
    if (selectedIndex >= 0 && filteredUsers[selectedIndex]) {
      handleSelectUser(filteredUsers[selectedIndex]._id);
    } else if (filteredUsers.length > 0) {
      handleSelectUser(filteredUsers[0]._id);
    } else if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    } else {
      router.push("/");
    }
    setSelectedIndex(-1);
  };

  const renderUserSuggestions = (
    show: boolean,
    onSelect: (id: string) => void,
  ) => {
    const q = searchQuery.trim();
    if (!show || !q) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-bgSecondary/95 backdrop-blur-xl border border-borderPrimary/60 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 p-2 space-y-1">
        <div className="px-2.5 py-1.5 border-b border-borderPrimary/30 flex items-center justify-between text-[11px] font-bold text-textSecondary">
          <span>{isArabic ? "نتائج البحث عن مستخدم" : "User Suggestions"}</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">
            {filteredUsers.length}
          </span>
        </div>

        {filteredUsers.length > 0 ? (
          <div
            id="user-suggestions-list"
            role="listbox"
            aria-label={
              isArabic ? "قائمة اقتراحات المستخدمين" : "User Suggestions List"
            }
            className="space-y-0.5 max-h-64 overflow-y-auto"
          >
            {filteredUsers.map((u, idx) => {
              const displayName = u.fullName || u.username;
              const formattedUsername = u.username.startsWith("@")
                ? u.username
                : `@${u.username}`;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={u._id}
                  id={`user-suggestion-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  type="button"
                  onClick={() => onSelect(u._id)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all text-left rtl:text-right cursor-pointer group ${
                    isSelected
                      ? "bg-primary/20 text-primary border border-primary/30 shadow-xs"
                      : "hover:bg-primary/10"
                  }`}
                >
                  {u.profilePicture?.url ? (
                    <img
                      src={u.profilePicture.url}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover border border-borderPrimary shrink-0 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 font-bold text-xs group-hover:scale-105 transition-transform">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}

                  <div className="overflow-hidden min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Text
                        as="span"
                        size="xs"
                        font="bold"
                        color="primary"
                        className="truncate group-hover:text-primary leading-tight"
                      >
                        {displayName}
                      </Text>
                      {u.role === "SuperAdmin" ? (
                        <Crown className="h-3 w-3 text-amber-400 shrink-0 inline" />
                      ) : u.role === "Admin" ? (
                        <span className="text-[9px] font-extrabold text-amber-500 bg-amber-500/10 px-1 rounded border border-amber-500/20 shrink-0">
                          {t.admin.admin}
                        </span>
                      ) : null}
                    </div>
                    <Text
                      as="span"
                      size="xs"
                      color="secondary"
                      className="block truncate text-[10px] text-textSecondary leading-tight"
                    >
                      {formattedUsername}
                    </Text>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-textSecondary font-medium">
            {t.nav.noUsersFound}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="w-full border-b border-borderPrimary/40 bg-bgPrimary/85 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <Image src="/logo.png" alt="Logo" width={34} height={34} />
          <Text
            as="span"
            size="xl"
            font="extraBold"
            color="primary"
            className="inline-block"
          >
            Fluxion
          </Text>
        </Link>

        {/* Global Search Bar (Desktop View) */}
        <form
          ref={desktopSearchRef}
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md relative"
          suppressHydrationWarning
        >
          <Search className="absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
          <input
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showDesktopSuggestions && filteredUsers.length > 0}
            aria-controls="user-suggestions-list"
            aria-activedescendant={
              selectedIndex >= 0
                ? `user-suggestion-${selectedIndex}`
                : undefined
            }
            placeholder={t.nav.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDesktopSuggestions(true);
            }}
            onFocus={() => setShowDesktopSuggestions(true)}
            onKeyDown={(e) => handleKeyDown(e, false)}
            className="w-full ltr:pl-10 ltr:pr-9 rtl:pr-10 rtl:pl-9 py-2 text-xs sm:text-sm rounded-xl bg-bgSecondary/80 border border-borderPrimary/60 text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            suppressHydrationWarning
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label={isArabic ? "مسح البحث" : "Clear search"}
              className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-textSecondary hover:text-textPrimary hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {renderUserSuggestions(showDesktopSuggestions, handleSelectUser)}
        </form>

        {/* Right Action Items & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Language Switcher (Desktop) */}
          {mounted && (
            <Tooltip
              position="bottom"
              content={isArabic ? "Change to English" : "غير لعربي"}
            >
              <button
                onClick={toggleLanguage}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-bgSecondary/60 hover:bg-bgSecondary border border-borderPrimary/40 text-textSecondary hover:text-textPrimary transition-all cursor-pointer text-xs font-bold"
                aria-label="Toggle Language"
              >
                <Globe className="h-4 w-4 text-primary" />
                <span className="font-extrabold text-[11px] text-primary">
                  {language === "en" ? "عربي" : "EN"}
                </span>
              </button>
            </Tooltip>
          )}

          {/* Theme Switcher (Desktop) */}
          {mounted && (
            <Tooltip
              position="bottom"
              content={theme === "dark" ? t.nav.themeLight : t.nav.themeDark}
            >
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hidden md:flex p-2 rounded-xl bg-bgSecondary/60 hover:bg-bgSecondary border border-borderPrimary/40 text-textSecondary hover:text-textPrimary transition-all cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600" />
                )}
              </button>
            </Tooltip>
          )}

          {/* Admin Dashboard Quick Button */}
          {mounted &&
            token &&
            (user?.role === "Admin" || user?.role === "SuperAdmin") && (
              <Tooltip position="bottom" content={t.nav.adminDashboard}>
                <Link href="/admin/dashboard/users">
                  <button
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 hover:text-amber-400 text-xs flex items-center gap-1.5 cursor-pointer font-bold transition-all"
                    aria-label="Admin Dashboard"
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0 text-amber-500" />
                    <Text
                      as="span"
                      size="xs"
                      font="bold"
                      className="hidden md:inline-block text-amber-500 group-hover:text-amber-400 transition-colors"
                    >
                      {t.nav.dashboard}
                    </Text>
                  </button>
                </Link>
              </Tooltip>
            )}

          {/* Notifications Dropdown */}
          {mounted && token && <NotificationDropdown />}

          {/* Messages / Chat Link */}
          {mounted && token && (
            <Tooltip position="bottom" content={t.nav.messages}>
              <Link href="/chat">
                <button
                  className="relative p-2 rounded-xl bg-bgSecondary/60 hover:bg-bgSecondary border border-borderPrimary/40 text-textSecondary hover:text-textPrimary transition-all cursor-pointer"
                  aria-label="Messages"
                >
                  <MessageSquare className="h-4 w-4 text-primary" />
                  {totalUnreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-primary text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse shadow-xs">
                      {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
                    </span>
                  )}
                </button>
              </Link>
            </Tooltip>
          )}

          {/* User Dropdown / Auth Links */}
          {mounted &&
            (token ? (

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl bg-bgSecondary/60 hover:bg-bgSecondary border border-borderPrimary/40 transition-all cursor-pointer"
                  aria-label="User profile menu"
                  suppressHydrationWarning
                >
                  {user?.profilePicture?.url ? (
                    <img
                      src={user.profilePicture.url}
                      alt={user.fullName || "User Avatar"}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-2 ring-primary/20">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                  <Text
                    as="span"
                    size="xs"
                    font="bold"
                    color="primary"
                    className="hidden md:inline-block max-w-28 truncate"
                  >
                    {user?.fullName || t.nav.account}
                  </Text>
                  <ChevronDown className="hidden md:inline-block h-3.5 w-3.5 text-textSecondary" />
                </button>

                {dropdownOpen && (
                  <div
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute ltr:right-0 rtl:left-0 mt-2 w-48 rounded-2xl bg-bgSecondary border border-borderPrimary shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-2 border-b border-borderPrimary/40">
                      <Text
                        as="p"
                        size="xs"
                        font="bold"
                        color="primary"
                        className="truncate"
                      >
                        {user?.username || t.nav.user}
                      </Text>
                      <Text
                        as="p"
                        size="xs"
                        color="secondary"
                        className="text-[11px] truncate"
                      >
                        {user?.email || ""}
                      </Text>
                    </div>

                    <Link
                      href={`/profile/${user?._id || "me"}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-primary" />
                      <Text as="span" size="xs" font="medium" color="primary">
                        {t.nav.myProfile}
                      </Text>
                    </Link>

                    {(user?.role === "Admin" ||
                      user?.role === "SuperAdmin") && (
                      <Link
                        href="/admin/dashboard/users"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-500 hover:bg-amber-500/10 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-amber-500" />
                        <Text
                          as="span"
                          size="xs"
                          font="medium"
                          className="text-amber-500"
                        >
                          {t.nav.adminDashboard}
                        </Text>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors ltr:text-left rtl:text-right cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <Text
                        as="span"
                        size="xs"
                        font="medium"
                        className="text-rose-500"
                      >
                        {t.nav.logOut}
                      </Text>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-xs cursor-pointer"
                  >
                    <Text as="span" size="xs" font="semiBold" color="primary">
                      {t.nav.signIn}
                    </Text>
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="sm"
                    className="rounded-xl bg-primary hover:bg-primaryHover text-primary-foreground text-xs cursor-pointer"
                  >
                    <Text as="span" size="xs" font="semiBold" color="white">
                      {t.nav.signUp}
                    </Text>
                  </Button>
                </Link>
              </div>
            ))}

          {/* Mobile Hamburger Toggle Button */}
          {mounted && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-bgSecondary/60 border border-borderPrimary/40 text-textPrimary cursor-pointer transition-colors md:hidden"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer / Collapsible Menu */}
      {mounted && mobileMenuOpen && (
        <div className="md:hidden border-t border-borderPrimary/40 bg-bgPrimary/95 backdrop-blur-xl px-4 py-4 space-y-4 animate-in slide-in-from-top duration-200">
          {/* Mobile Search Input */}
          <form
            ref={mobileSearchRef}
            onSubmit={handleSearchSubmit}
            className="relative w-full"
          >
            <Search className="absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
            <input
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showMobileSuggestions && filteredUsers.length > 0}
              aria-controls="user-suggestions-list"
              aria-activedescendant={
                selectedIndex >= 0
                  ? `user-suggestion-${selectedIndex}`
                  : undefined
              }
              placeholder={t.nav.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowMobileSuggestions(true);
              }}
              onFocus={() => setShowMobileSuggestions(true)}
              onKeyDown={(e) => handleKeyDown(e, true)}
              className="w-full ltr:pl-10 ltr:pr-9 rtl:pr-10 rtl:pl-9 py-2 text-xs rounded-xl bg-bgSecondary border border-borderPrimary/60 text-textPrimary placeholder:text-textSecondary/60 outline-none"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label={isArabic ? "مسح البحث" : "Clear search"}
                className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-textSecondary hover:text-textPrimary hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {renderUserSuggestions(showMobileSuggestions, handleSelectUser)}
          </form>

          {/* Quick Actions Row: Language & Theme */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bgSecondary border border-borderPrimary/40 text-xs font-bold text-primary cursor-pointer"
            >
              <Globe className="h-4 w-4 text-primary" />
              <span>{language === "en" ? "العربية" : "English"}</span>
            </button>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bgSecondary border border-borderPrimary/40 text-xs font-medium text-textPrimary cursor-pointer"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>{t.nav.themeLight}</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-600" />
                  <span>{t.nav.themeDark}</span>
                </>
              )}
            </button>
          </div>

          {/* Admin Dashboard button on Mobile */}
          {token && (user?.role === "Admin" || user?.role === "SuperAdmin") && (
            <Link
              href="/admin/dashboard/users"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold text-xs"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>{t.nav.adminDashboard}</span>
            </Link>
          )}

          {/* User Links on Mobile */}
          {token ? (
            <div className="pt-2 border-t border-borderPrimary/40 space-y-2">
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-bgSecondary/60 hover:bg-bgSecondary text-xs font-semibold text-textPrimary transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span>{t.nav.messages}</span>
                </div>
                {totalUnreadMessages > 0 && (
                  <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                    {totalUnreadMessages}
                  </span>
                )}
              </Link>

              <Link
                href={`/profile/${user?._id || "me"}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-bgSecondary/60 hover:bg-bgSecondary text-xs font-semibold text-textPrimary transition-colors"
              >

                {user?.profilePicture?.url ? (
                  <img
                    src={user.profilePicture.url}
                    alt={user.username}
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-textPrimary">{user?.username}</p>
                  <p className="text-[11px] text-textSecondary">
                    {user?.email}
                  </p>
                </div>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-semibold hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.nav.logOut}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-borderPrimary/40">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full text-xs rounded-xl cursor-pointer"
                >
                  {t.nav.signIn}
                </Button>
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full text-xs rounded-xl bg-primary text-white cursor-pointer">
                  {t.nav.signUp}
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
