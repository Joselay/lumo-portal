"use client";

import {
  IconCalendar,
  IconCamera,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconMovie,
  IconReport,
  IconSearch,
  IconSettings,
  IconTags,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type * as React from "react";

import { authApi } from "@/api/auth";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { User, CustomerProfile } from "@/types/auth";

const data = {
  navMain: [
    {
      title: "Movies",
      url: "/movies",
      icon: IconMovie,
    },
    {
      title: "Users",
      url: "/users",
      icon: IconUsers,
    },
    {
      title: "Genres",
      url: "/genres",
      icon: IconTags,
    },
    {
      title: "Bookings",
      url: "/bookings",
      icon: IconCalendar,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] =
    useState<CustomerProfile | null>(null);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await authApi.getProfile();
        setUser(profileData.user);
        setCustomerProfile(profileData.customer_profile);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const userData = user
    ? {
        name:
          customerProfile?.full_name ||
          `${user.first_name} ${user.last_name}`.trim() ||
          user.username,
        email: user.email,
        avatar: customerProfile?.avatar_url || "/avatars/default.jpg",
      }
    : {
        name: "Loading...",
        email: "",
        avatar: "/avatars/default.jpg",
      };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Lumo</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
