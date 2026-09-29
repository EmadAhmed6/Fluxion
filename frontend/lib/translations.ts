export type Language = "en" | "ar";

import { navTranslations, NavTranslations } from "@/_components/nav.translations";
import { homeTranslations, HomeTranslations } from "@/app/home.translations";
import {
  postTranslations,
  PostTranslations,
  createEditPostTranslations,
  CreateEditPostTranslations,
} from "@/app/posts/translations";
import { profileTranslations, ProfileTranslations } from "@/app/profile/translations";
import { adminTranslations, AdminTranslations } from "@/app/admin/translations";
import { authTranslations, AuthTranslations } from "@/app/auth/translations";
import {
  chatTranslations,
  ChatTranslations,
} from "@/app/chat/translations";


export interface TranslationSchema {
  nav: NavTranslations;
  home: HomeTranslations;
  post: PostTranslations;
  createEditPost: CreateEditPostTranslations;
  profile: ProfileTranslations;
  admin: AdminTranslations;
  auth: AuthTranslations;
  chat: ChatTranslations;
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    nav: navTranslations.en,
    home: homeTranslations.en,
    post: postTranslations.en,
    createEditPost: createEditPostTranslations.en,
    profile: profileTranslations.en,
    admin: adminTranslations.en,
    auth: authTranslations.en,
    chat: chatTranslations.en,
  },
  ar: {
    nav: navTranslations.ar,
    home: homeTranslations.ar,
    post: postTranslations.ar,
    createEditPost: createEditPostTranslations.ar,
    profile: profileTranslations.ar,
    admin: adminTranslations.ar,
    auth: authTranslations.ar,
    chat: chatTranslations.ar,
  },
};

