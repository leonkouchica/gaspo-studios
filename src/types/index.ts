import React from "react";

/**
 * Named TypeScript interfaces as specified in Section 5.2 of the build instructions.
 */

export interface Service {
  id: string;
  name: string;
  desc: string;
  price: string;
  img?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export interface TeamMember {
  name: string;
  role: string;
  img: string;
  bio: string;
  role2?: boolean;
}

export interface BlogPost {
  cat: string;
  title: string;
  excerpt: string;
  img: string;
  date: string;
  comments?: number;
}

export interface EventItem {
  title: string;
  date?: string;
  img?: string;
  m?: string;
  d?: number;
  time?: string;
  loc?: string;
  desc?: string;
}

export interface Product {
  cat: string;
  name: string;
  price: string;
  img: string;
}
