"use client";

import {
	BadgeDollarSign,
	Bell,
	BriefcaseBusiness,
	CarFront,
	CircleUserRound,
	FileCheck2,
	Gavel,
	Heart,
	LayoutDashboard,
	PanelLeftClose,
	PanelLeftOpen,
	ShieldCheck,
	X,
} from "lucide-react";
import Link from "next/link";
import { useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
interface ShellUserContext {
	isAuthenticated: boolean;
	logout: () => Promise<void> | void;
	user: { id?: string | number; firstname?: string; lastname?: string; email?: string; roles?: Array<string | { name?: string }> } | null;
}
import { LangSwitch, type Lang } from "@/context/LangSwitch";
import Image from "next/image";
import ConfirmModal from "../ui/ConfirmModal";
import { useIntl } from "react-intl";
import { useUserContext } from "@/context/UserContext";
import { LocaleControl } from "../layout/PublicHeader";
import { SidebarAccountMenu } from "../layout/SidebarAccountMenu";
import { SidebarNavSearch } from "../layout/SidebarNavSearch";
import { translateUiText } from "@/lib/localization/uiText";
import { useNotificationsByUserId } from "@/queries/notifications";

interface HeaderNotification {
	body: string;
	createdAt: string;
	id: string;
	title: string;
}

const notificationCopy: Record<Lang, { close: string; empty: string; open: string; title: string; unread: string }> = {
	uz: { close: "Bildirishnomalarni yopish", empty: "O‘qilmagan bildirishnoma yo‘q", open: "Bildirishnomalar sahifasiga o‘tish", title: "Bildirishnomalar markazi", unread: "Faqat o‘qilmaganlar" },
	en: { close: "Close notifications", empty: "No unread notifications", open: "Go to notifications", title: "Notification center", unread: "Unread only" },
	ru: { close: "Закрыть уведомления", empty: "Нет непрочитанных уведомлений", open: "Перейти к уведомлениям", title: "Центр уведомлений", unread: "Только непрочитанные" },
};

function unreadNotifications(value: unknown): HeaderNotification[] {
	const source = Array.isArray(value)
		? value
		: value && typeof value === "object" && "data" in value && Array.isArray((value as { data?: unknown }).data)
			? (value as { data: unknown[] }).data
			: [];
	return source.flatMap((candidate) => {
		if (!candidate || typeof candidate !== "object") return [];
		const record = candidate as Record<string, unknown>;
		if (record.isRead === true) return [];
		const id = record.id ?? record.notificationId ?? record.notifId;
		const title = typeof record.title === "string" ? record.title.trim() : "";
		const body = typeof record.body === "string" ? record.body.trim() : "";
		if ((typeof id !== "string" && typeof id !== "number") || (!title && !body)) return [];
		return [{ body, createdAt: typeof record.createdAt === "string" ? record.createdAt : "", id: String(id), title: title || body }];
	}).sort((left, right) => Date.parse(right.createdAt || "0") - Date.parse(left.createdAt || "0"));
}

function HeaderNotifications({ currentLang, userId }: { currentLang: Lang; userId?: string | number }) {
	const copy = notificationCopy[currentLang];
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const query = useNotificationsByUserId(userId);
	const notifications = useMemo(() => unreadNotifications(query.data), [query.data]);

	useEffect(() => {
		if (!open) return;
		const closeOnOutsideClick = (event: MouseEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", closeOnOutsideClick);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("mousedown", closeOnOutsideClick);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [open]);

	return (
		<div className="relative" ref={rootRef}>
			<button
				aria-expanded={open}
				aria-label={`${copy.title}: ${notifications.length}`}
				className="relative grid size-11 place-items-center rounded-full text-text-secondary transition-colors hover:bg-surface-muted hover:text-brand-navy-900 focus-visible:outline-3 focus-visible:outline-focus-ring"
				onClick={() => setOpen((current) => !current)}
				type="button"
			>
				<Bell aria-hidden="true" size={23} />
				{notifications.length ? <span className="absolute -right-2 -top-2 min-w-7 rounded-full bg-semantic-danger px-1.5 py-1 text-center text-[0.65rem] font-black leading-none text-white shadow-sm">{notifications.length > 99 ? "99+" : notifications.length}</span> : null}
			</button>
			{open ? (
				<div className="absolute left-0 sm:left-auto sm:right-0 top-[calc(100%+0.75rem)] z-50 w-[calc(100vw-3rem)] sm:w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border-default bg-white shadow-2xl">
					<div className="flex items-start justify-between gap-3 border-b border-border-default p-4">
						<div><h2 className="font-extrabold text-brand-navy-900">{copy.title}</h2><p className="mt-1 text-sm text-text-secondary">{copy.unread}: {notifications.length}</p></div>
						<div className="flex items-center gap-1">
							<Link className="rounded-md border border-border-default px-3 py-2 text-sm font-bold text-brand-navy-900 hover:bg-surface-muted" href="/dashboard/notifications" onClick={() => setOpen(false)}>{copy.open}</Link>
							<button aria-label={copy.close} className="grid size-10 place-items-center rounded-md hover:bg-surface-muted" onClick={() => setOpen(false)} type="button"><X aria-hidden="true" size={18}/></button>
						</div>
					</div>
					{query.isLoading ? <div className="space-y-3 p-4" aria-label={copy.title}>{Array.from({ length: 3 }, (_, index) => <div className="h-16 animate-pulse rounded-md bg-surface-muted" key={index}/>)}</div> : notifications.length ? (
						<ul className="max-h-[27rem] divide-y divide-border-default overflow-y-auto">
							{notifications.slice(0, 8).map((notification) => <li key={notification.id}><Link className="flex gap-3 p-4 transition-colors hover:bg-surface-muted" href={`/dashboard/notifications?notificationId=${encodeURIComponent(notification.id)}`} onClick={() => setOpen(false)}><span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-semantic-danger"/><span className="min-w-0"><span className="block font-extrabold text-brand-navy-900">{notification.title}</span>{notification.body && notification.body !== notification.title ? <span className="mt-1 line-clamp-2 block text-sm leading-6 text-text-secondary">{notification.body}</span> : null}{notification.createdAt ? <time className="mt-2 block text-xs font-bold text-text-secondary" dateTime={notification.createdAt}>{new Intl.DateTimeFormat(currentLang === "uz" ? "uz-UZ" : currentLang === "ru" ? "ru-RU" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(notification.createdAt))}</time> : null}</span></Link></li>)}
						</ul>
					) : <p className="p-6 text-center text-sm font-bold text-text-secondary">{copy.empty}</p>}
				</div>
			) : null}
		</div>
	);
}

const destinations = [
	{ slug: "", icon: LayoutDashboard, sellerOnly: false },
	{ slug: "watchlist", icon: Heart, sellerOnly: false },
	{ slug: "bids", icon: Gavel, sellerOnly: false },
	{ slug: "vehicles", icon: CarFront, sellerOnly: true },
	{ slug: "deals", icon: FileCheck2, sellerOnly: false },
	{ slug: "payments", icon: BadgeDollarSign, sellerOnly: false },
	{ slug: "notifications", icon: Bell, sellerOnly: false },
	{ slug: "kyc", icon: ShieldCheck, sellerOnly: false },
	// { slug: "profile", icon: CircleUserRound, sellerOnly: false },
	{ slug: "dealer", icon: BriefcaseBusiness, sellerOnly: true },
] as const;

const shellMessages: Record<
	Lang,
	{
		area: string;
		mobileNavLabel: string;
		navLabel: string;
		tabsLabel: string;
		userPanel: string;
		labels: Record<string, string>;
		admin: string;
		logout: string;
	}
> = {
	uz: {
		area: "Shaxsiy maydon",
		admin: "Admin paneli",
		logout: "Chiqish",
		    userPanel: "Mening profilim",
		mobileNavLabel: "Mobil kabinet yo‘nalishlari",
		navLabel: "Kabinet bo‘limlari",
		tabsLabel: "Kabinet bo‘limlari yorliqlari",
		labels: {
			"": "Kabinet",
			watchlist: "Saqlanganlar",
			bids: "Takliflarim",
			vehicles: "Auksionlar",
			deals: "Bitimlar",
			payments: "To‘lovlar",
			notifications: "Bildirishnomalar",
			kyc: "Shaxsni tasdiqlash",
			profile: "Profil",
			dealer: "Diler markazi",
		},
	},
	en: {
		area: "Personal workspace",
		admin: "Admin panel",
		logout: "Logout",
		mobileNavLabel: "Mobile cabinet destinations",
		navLabel: "Cabinet sections",
		    userPanel: "My Profile",
		tabsLabel: "Cabinet section tabs",
		labels: {
			"": "Cabinet",
			watchlist: "Saved",
			bids: "My bids",
			vehicles: "Auctions",
			deals: "Deals",
			payments: "Payments",
			notifications: "Notifications",
			kyc: "Identity verification",
			profile: "Profile",
			dealer: "Dealer center",
		},
	},
	ru: {
		area: "Личное пространство",
		admin: "Панель администратора",
		    userPanel: "Мой профиль",
		logout: "Выйти",
		mobileNavLabel: "Мобильные разделы кабинета",
		navLabel: "Разделы кабинета",
		tabsLabel: "Вкладки разделов кабинета",
		labels: {
			"": "Кабинет",
			watchlist: "Избранное",
			bids: "Мои ставки",
			vehicles: "Аукционы",
			deals: "Сделки",
			payments: "Платежи",
			notifications: "Уведомления",
			kyc: "Проверка личности",
			profile: "Профиль",
			dealer: "Центр дилера",
		},
	},
};

export interface CabinetShellProps {
	active: string;
	eyebrow: string;
	title: string;
	description: string;
	children: ReactNode;
	action?: ReactNode;
	compact?: boolean;
	isSeller?: boolean;
}

export function CabinetShell({
	action,
	active,
	children,
	compact = false,
	description,
	eyebrow,
	isSeller,
	title,
}: CabinetShellProps) {
	const { currentLang } = useContext(LangSwitch);
	const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
	const [logoutPending, setLogoutPending] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [navSearch, setNavSearch] = useState("");
	const cancelLogout = () => {
		if (!logoutPending) setLogoutConfirmOpen(false);
	};
	const copy = shellMessages[currentLang];
	const { logout, user } = useUserContext() as ShellUserContext;
	const visibleDestinations = destinations;
	const normalizedNavSearch = navSearch.trim().toLocaleLowerCase(currentLang);
	const filteredDestinations = visibleDestinations.filter(({ slug }) => {
		if (!normalizedNavSearch) return true;
		const label = copy.labels[slug].toLocaleLowerCase(currentLang);
		const href = (slug ? `/dashboard/${slug}` : "/dashboard").toLocaleLowerCase();
		return label.includes(normalizedNavSearch) || href.includes(normalizedNavSearch);
	});
	const mobileDestinationSlugs = ["", "watchlist", "bids", "vehicles", "payments", "notifications"];
	const mobileDestinations = visibleDestinations.filter(({ slug }) =>
		mobileDestinationSlugs.includes(slug),
	);
	const confirmLogout = async () => {
		setLogoutPending(true);
		try {
			await logout();
			setLogoutConfirmOpen(false);
		} finally {
			setLogoutPending(false);
		}
	};
	const isAdmin = user?.roles?.some((role) =>
		(typeof role === "string" ? role : role.name)?.trim().toUpperCase() === "ADMIN",
	) ?? false;
	const identityName = [user?.firstname, user?.lastname].filter(Boolean).join(" ") || user?.email || copy.userPanel;


	const identityRole = user?.roles
		?.map((role) => typeof role === "string" ? role : role.name)
		.find(Boolean) ?? copy.area;
	const initials = identityName
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toLocaleUpperCase())
		.join("") || "U";
	const intl = useIntl();
	return (
		<div className='bg-surface-canvas'>
			<ConfirmModal
				open={logoutConfirmOpen}
				title={intl.formatMessage({ id: "logouttitle" })}
				description={intl.formatMessage({
					id: "logoutdescription",
					defaultMessage: "Hisobdan chiqish uchun amalni tasdiqlang.",
				})}
				confirmText={intl.formatMessage({ id: "logoutconfirm" })}
				cancelText={intl.formatMessage({ id: "cancel" })}
				loading={logoutPending}
				onCancel={cancelLogout}
				onConfirm={() => {
					void confirmLogout();
				}}
			/>
			{/*
        No horizontal padding on this grid on purpose — the sidebar stays
        flush against the container's left edge (gap = 0), as requested.
        items-start stops the grid from stretching both columns to match
        the tallest one, so the sidebar and the page column size
        independently of each other.
      */}
			{/* Mobile Top Navbar */}
			<div className="lg:hidden flex items-center justify-between bg-brand-navy-900 text-white p-3 sticky top-0 z-40 shadow-sm border-b border-brand-navy-800">
				<Link href="/" className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-brand-champagne-500 rounded">
					<Image src="/brand.png" alt="TezAuksion" height={32} width={32} className="size-8 object-contain" />
					<span className="font-extrabold text-lg tracking-wide">
						Tez<span className="text-brand-champagne-500">Auksion</span>
					</span>
				</Link>
				<button
					aria-label={translateUiText(sidebarCollapsed ? "expandMenu" : "collapseMenu", currentLang)}
					className="grid size-9 shrink-0 place-items-center rounded-lg text-white/75 transition-colors hover:bg-white/10 hover:text-brand-champagne-500 focus-visible:outline-2 focus-visible:outline-brand-champagne-500"
					onClick={() => setSidebarCollapsed((current) => !current)}
					type="button"
				>
					{sidebarCollapsed ? <PanelLeftOpen aria-hidden="true" size={20} /> : <PanelLeftClose aria-hidden="true" size={20} />}
				</button>
			</div>

			<div className={`grid items-start gap-6 transition-[grid-template-columns] duration-200 ${sidebarCollapsed ? "lg:grid-cols-[76px_minmax(0,1fr)]" : "lg:grid-cols-[252px_minmax(0,1fr)]"}`}>
				<aside
					className={[
						"hidden self-start overflow-hidden border border-brand-navy-800",
						"bg-brand-navy-900 text-white shadow-sticky",
						"lg:sticky lg:top-0 lg:flex",
						"lg:h-dvh",
						"lg:flex-col",
					].join(" ")}
				>
					<div className={`flex min-h-[5.25rem] items-center border-b border-white/10 ${sidebarCollapsed ? "justify-center px-2" : "gap-2 px-4"}`}>
						{!sidebarCollapsed ? (
							<Link href="/" className="group flex min-w-0 flex-1 items-center gap-3">
								<Image src="/brand.png" alt="TezAuksion" height={42} width={42} className="size-10 shrink-0 object-contain" />
								<span className="min-w-0">
									<span className="block truncate text-lg font-extrabold tracking-wide text-white transition-colors group-hover:text-brand-champagne-500">
										Tez<span className="text-brand-champagne-500">Auksion</span>
									</span>
									<span className="block truncate text-[10px] font-bold uppercase tracking-wider text-white/55">{copy.area}</span>
								</span>
							</Link>
						) : null}
						<button
							aria-label={translateUiText(sidebarCollapsed ? "expandMenu" : "collapseMenu", currentLang)}
							className="grid size-11 shrink-0 place-items-center rounded-xl text-white/65 transition-colors hover:bg-white/10 hover:text-brand-champagne-500 focus-visible:outline-2 focus-visible:outline-brand-champagne-500"
							onClick={() => setSidebarCollapsed((current) => !current)}
							type="button"
						>
							{sidebarCollapsed ? <PanelLeftOpen aria-hidden="true" size={22} /> : <PanelLeftClose aria-hidden="true" size={22} />}
						</button>
					</div>
					<SidebarNavSearch
						compact={sidebarCollapsed}
						onChange={setNavSearch}
						onRequestExpand={() => setSidebarCollapsed(false)}
						value={navSearch}
					/>
					<nav aria-label={copy.navLabel} className='min-h-0 flex-1 overflow-y-auto p-2'>
						{filteredDestinations.map(({ icon: Icon, slug }) => {
							const current = active === slug;
							const label = copy.labels[slug];
							return (
								<Link
									key={slug || "overview"}
									href={slug ? `/dashboard/${slug}` : "/dashboard"}
									aria-current={current ? "page" : undefined}
									className={`flex min-h-11 items-center rounded-md text-sm font-bold transition-colors ${sidebarCollapsed ? "mx-auto size-12 justify-center px-0" : "gap-3 px-3 py-2.5"} ${
										current
											? "bg-brand-champagne-500 text-brand-navy-950"
											: "text-white/78 hover:bg-white/8 hover:text-white"
									}`}
									title={sidebarCollapsed ? label : undefined}
								>
									<Icon aria-hidden='true' size={sidebarCollapsed ? 22 : 18} strokeWidth={1.8} />
									<span className={sidebarCollapsed ? "sr-only" : undefined}>{label}</span>
								</Link>
							);
						})}
					</nav>
					<SidebarAccountMenu
						compact={sidebarCollapsed}
						initials={initials}
						links={[
							...(isAdmin ? [{ href: "/admin", icon: ShieldCheck, label: copy.admin }] : []),
							{ href: "/dashboard/profile", icon: CircleUserRound, label: copy.userPanel },
						]}
						logoutLabel={copy.logout}
						menuLabel={`${identityName}: ${copy.userPanel}`}
						name={identityName}
						onLogout={() => setLogoutConfirmOpen(true)}
						onRequestExpand={() => setSidebarCollapsed(false)}
						role={identityRole}
					/>
				</aside>

				<section className={`min-w-0 px-4 sm:px-6 pb-20 lg:pb-0 ${compact ? "mt-3" : "mt-4 sm:mt-6"}`}>
					<nav
						aria-label={copy.tabsLabel}
						className='-mx-[var(--content-gutter)] hidden mb-5 flex gap-2 overflow-x-auto border-y border-border-default bg-surface-primary px-[var(--content-gutter)] py-3 lg:hidden'
					>
						{isAdmin ? (
							<Link
								href='/admin'
								className='shrink-0 rounded-full border border-brand-champagne-600 bg-brand-champagne-500 px-4 py-2 text-sm font-bold text-brand-navy-950'
							>
								{copy.admin}
							</Link>
						) : null}
						{visibleDestinations.map(({ slug }) => {
							const current = active === slug;
							const label = copy.labels[slug];
							return (
								<Link
									key={slug || "overview"}
									href={slug ? `/dashboard/${slug}` : "/dashboard"}
									aria-current={current ? "page" : undefined}
									className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${
										current
											? "border-brand-navy-900 bg-brand-navy-900 text-white"
											: "border-border-default bg-white text-text-secondary"
									}`}
								>
									{label}
								</Link>
							);
						})}
					</nav>

					<header className={`flex flex-col justify-between border-b border-border-default sm:flex-row sm:items-end ${compact ? "mb-3 gap-2 pb-3" : "mb-6 gap-4 pb-6"}`}>
						<div>
							<p className='text-xs font-extrabold uppercase tracking-[0.18em] text-brand-gold-text'>
								{eyebrow}
							</p>
							<h1 className={`font-display font-bold tracking-[-0.03em] text-brand-navy-900 ${compact ? "mt-1 text-3xl" : "mt-2 text-3xl md:text-4xl"}`}>
								{title}
							</h1>
							<p className={`max-w-2xl text-sm text-text-secondary ${compact ? "mt-1 leading-5" : "mt-2 leading-6 md:text-base"}`}>
								{description}
							</p>
						</div>
						<div className='flex flex-wrap items-center justify-end gap-2 sm:gap-4 w-full sm:w-auto'>
							<HeaderNotifications currentLang={currentLang} userId={user?.id} />
							<div className="hidden sm:block">
								<LocaleControl className='text-brand-navy-900' />
							</div>
							<div className="sm:hidden">
								<LocaleControl compact className='text-brand-navy-900' />
							</div>
							{action ? <div className='shrink-0'>{action}</div> : null}
						</div>
					</header>

					{/*
            Every routed page (Cabinet, Saved, Bids, ...) gets this same
            top/bottom padding automatically — individual pages don't need
            to add their own spacing, and this box is what keeps content
            from butting straight up against the footer.
          */}
					<div className={compact ? "pb-4" : "pb-16 pt-2 lg:pb-24"}>{children}</div>
				</section>
			</div>
			<nav
				aria-label={copy.mobileNavLabel}
				className='fixed inset-x-0 bottom-0 z-40 border-t border-border-default bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-sticky backdrop-blur lg:hidden'
			>
				<div className='mx-auto grid max-w-xl grid-cols-6 px-1 py-1.5'>
					{mobileDestinations.map(({ icon: Icon, slug }) => {
						const current = active === slug;
						const label = copy.labels[slug];
						return (
							<Link
								aria-current={current ? "page" : undefined}
								className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-0.5 text-[0.62rem] font-bold leading-tight text-center focus-visible:outline-3 focus-visible:outline-focus-ring ${
									current ? "text-brand-navy-950" : "text-text-secondary"
								}`}
								href={slug ? `/dashboard/${slug}` : "/dashboard"}
								key={slug || "overview"}
							>
								<Icon
									aria-hidden='true'
									className={current ? "text-brand-gold-text" : undefined}
									size={18}
									strokeWidth={current ? 2.2 : 1.8}
								/>
								<span className='w-full truncate text-center text-[0.6rem] leading-tight'>{label}</span>
							</Link>
						);
					})}
				</div>
			</nav>
		</div>
	);
}
