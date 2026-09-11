"use client"
import React, { useState } from 'react';
import {
    Search, Heart, Filter, Grid, List, TrendingUp, Car, Info, Tag, Zap,
    BarChart, ShoppingBag, Users, Award, AlertCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAllLotsAvailable } from '@/queries/lots';
import Link  from 'next/link';
import LotCard from '@/components/Lots/LotCard';
import LotCardGrid from '@/components/Lots/LotCardGrid';
import LotCardList from '@/components/Lots/LotCardList';
import TrendingLotCard from '@/components/Lots/TrendingLotCard';
import Upcoming from '@/components/Lots/Upcoming/Upcoming';
import { AppSelect } from '@/components/ui/AppSelect';

export default function AuctionsPage() {
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const { data: auctions } = useAllLotsAvailable();

    // Categories data
    const categories = [
        { id: 'all', name: 'Barchasi', icon: null, count: 24 },
        { id: 'transport', name: 'Transport', icon: <Car className="h-4 w-4" />, count: 8 },
        { id: 'electronics', name: 'Elektronika', icon: null, count: 6 },
        { id: 'jewelry', name: 'Zargarlik buyumlari', icon: null, count: 4 },
        { id: 'antiques', name: 'Antikvariat', icon: null, count: 3 },
        { id: 'home', name: 'Uy-ro\'zg\'or buyumlari', icon: null, count: 2 },
        { id: 'art', name: 'San\'at asarlari', icon: null, count: 1 }
    ];

    // Render grid item
    const renderGridItem = (auction) => (
        <LotCardGrid lot={auction} />
    );

    // Render list item
    const renderListItem = (auction) => (
        <LotCardList lot={auction} />
    );

    return (

        <div className="min-h-screen bg-gray-50 mt-16">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Barcha auksionlar</h1>
                            <p className="text-gray-500 mt-1">Auction bozoridagi eng so'nggi mahsulotlarni ko'ring</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href='/dashboard/likes'>
                                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1 transition">
                                    <Heart className="h-4 w-4" />
                                    <span>Saqlanganlar</span>
                                </button>
                            </Link>
                            <Link href='/dashboard/createlot'>
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 transition">
                                    <ShoppingBag className="h-4 w-4" />
                                    <span>Auksion yaratish</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border-t border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        {/* Search */}
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Avtomobil nomi, modeli yoki kalit so'z bo'yicha qidirish..."
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex space-x-2 w-full md:w-auto">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center justify-center px-4 py-3 border rounded-lg hover:bg-gray-50 transition ${showFilters ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-700'
                                    }`}
                            >
                                <Filter className="h-5 w-5 mr-2" />
                                <span>Filtrlash</span>
                            </button>

                            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex items-center justify-center p-3 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Grid className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex items-center justify-center p-3 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <List className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Expandable Filters */}
                    {showFilters && (
                        <div className="mt-4 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Saralash</label>
                                    <AppSelect
                                        options={[
                                            { value: "standard", label: "Standart" },
                                            { value: "price_low", label: "Narx: pastdan yuqoriga" },
                                            { value: "price_high", label: "Narx: yuqoridan pastga" },
                                            { value: "ending_soon", label: "Tez orada tugaydigan" },
                                            { value: "new", label: "Yangi qo'shilgan" },
                                            { value: "popular", label: "Eng mashhur" },
                                        ]}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Kategoriya</label>
                                    <AppSelect
                                        options={[
                                            { value: "", label: "Barcha kategoriyalar" },
                                            { value: "transport", label: "Transport" },
                                            { value: "electronics", label: "Elektronika" },
                                            { value: "jewelry", label: "Zargarlik buyumlari" },
                                            { value: "antiques", label: "Antikvariat" },
                                            { value: "home", label: "Uy-ro'zg'or buyumlari" },
                                        ]}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Narx oralig'i (UZS)</label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            placeholder="Min"
                                            className="block w-full p-2 border border-gray-300 rounded-md"
                                        />
                                        <span>-</span>
                                        <input
                                            type="text"
                                            placeholder="Max"
                                            className="block w-full p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <div className="space-y-2">
                                        <label className="inline-flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                                            <span className="ml-2 text-gray-700">Faol</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                                            <span className="ml-2 text-gray-700">Tez orada tugaydi</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                                            <span className="ml-2 text-gray-700">Kutilmoqda</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col md:flex-row gap-4">
                                <div className="space-y-2 w-full md:w-1/4">
                                    <label className="block text-sm font-medium text-gray-700">Joylashuv</label>
                                    <AppSelect
                                        options={[
                                            { value: "", label: "Barcha hududlar" },
                                            { value: "toshkent", label: "Toshkent" },
                                            { value: "andijon", label: "Andijon" },
                                            { value: "samarqand", label: "Samarqand" },
                                            { value: "buxoro", label: "Buxoro" },
                                            { value: "namangan", label: "Namangan" },
                                        ]}
                                    />
                                </div>

                                <div className="space-y-2 w-full md:w-1/4">
                                    <label className="block text-sm font-medium text-gray-700">Sotuvchi</label>
                                    <AppSelect
                                        options={[
                                            { value: "", label: "Barcha sotuvchilar" },
                                            { value: "verified", label: "Faqat tasdiqlangan" },
                                            { value: "rating", label: "Reyting: 4.5+" },
                                        ]}
                                    />
                                </div>

                                <div className="space-y-2 w-full md:w-2/4">
                                    <label className="block text-sm font-medium text-gray-700">Qo'shimcha shartlar</label>
                                    <div className="flex flex-wrap gap-4">
                                        <label className="inline-flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                                            <span className="ml-2 text-gray-700">Faqat suratli</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                                            <span className="ml-2 text-gray-700">Sertifikatli</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                                            <span className="ml-2 text-gray-700">Xalqaro yetkazib berish</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    Tozalash
                                </button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1">
                                    <Filter className="h-4 w-4" />
                                    <span>Filtrlash</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Quick Filters */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition ${activeCategory === category.id
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                onClick={() => setActiveCategory(category.id)}
                            >
                                {category.icon}
                                <span>{category.name}</span>
                                <span className="ml-1 text-xs text-gray-500">({category.count})</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                {/* Daily Highlights */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                            Bugungi eng yaxshi takliflar
                        </h3>
                        <a href="#" className="text-blue-600 hover:underline text-sm flex items-center">
                            <span>Barchasini ko'rish</span>
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {auctions?.slice(0, 3).map(auction => (
                            <LotCard lot={auction} />
                        ))}
                    </div>
                </div>

                {/* Trending Auctions */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                            Trend auksionlar
                        </h3>
                        <a href="#" className="text-blue-600 hover:underline text-sm flex items-center">
                            <span>Barchasini ko'rish</span>
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </a>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategoriya</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Narx</th>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Takliflar</th> */}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tugash vaqti</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {auctions?.slice(0, 5).map((auction) => (
                                        <TrendingLotCard lot={auction} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Upcoming Auctions */}
                <Upcoming />

                {/* All Auctions Grid/List View */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Barcha auksionlar</h3>
                        <div className="text-sm text-gray-600 flex items-center">
                            Saralash:
                            <div className="w-48 ml-2 inline-block"><AppSelect size="sm" options={["Standart", "Narx: pastdan yuqoriga", "Narx: yuqoridan pastga", "Eng mashhur", "Yangi qo'shilgan"]} /></div>
                        </div>
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {auctions?.map(auction => renderGridItem(auction))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            {auctions?.map(auction => renderListItem(auction))}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-700">
                            <span className="font-medium">6</span> / <span>24</span> lotlar ko'rsatilmoqda
                        </div>
                        <div className="flex space-x-1">
                            <button className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 flex items-center" disabled>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                <span>Oldingi</span>
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg bg-blue-50 text-blue-600 font-medium">
                                1
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50">
                                2
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50">
                                3
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50">
                                4
                            </button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 flex items-center">
                                <span>Keyingi</span>
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auction Stats */}
            <div className="bg-white border-t border-gray-200 py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-8 text-center">Auction statistikasi</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                        <div className="p-6 rounded-xl bg-blue-50">
                            <div className="text-blue-600 mb-2">
                                <BarChart className="h-8 w-8 mx-auto" />
                            </div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">120,458</div>
                            <div className="text-gray-600">Shu oy auksionlar</div>
                        </div>

                        <div className="p-6 rounded-xl bg-green-50">
                            <div className="text-green-600 mb-2">
                                <Users className="h-8 w-8 mx-auto" />
                            </div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">45,129</div>
                            <div className="text-gray-600">Faol ishtirokchilar</div>
                        </div>

                        <div className="p-6 rounded-xl bg-yellow-50">
                            <div className="text-yellow-600 mb-2">
                                <ShoppingBag className="h-8 w-8 mx-auto" />
                            </div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">87.4%</div>
                            <div className="text-gray-600">Muvaffaqiyatli auksionlar</div>
                        </div>

                        <div className="p-6 rounded-xl bg-purple-50">
                            <div className="text-purple-600 mb-2">
                                <Award className="h-8 w-8 mx-auto" />
                            </div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">9.2 mln</div>
                            <div className="text-gray-600">O'rtacha oylik savdo</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Become a Seller CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Siz ham sotuvchi bo'lishni xohlaysizmi?</h2>
                    <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                        O'z buyumlaringizni millionlab foydalanuvchilar oldida auksion orqali sotish imkoniyatiga ega bo'ling.
                        Biz sizga shaffof va ishonchli platforma taqdim etamiz.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Link href='/dashboard/createlot'>
                            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition shadow-lg">
                                Hozir boshlash
                            </button>
                        </Link>
                        <Link href='/sell'>
                            <button className="px-6 py-3 bg-transparent text-white border border-white rounded-lg font-bold hover:bg-white/10 transition">
                                Ko'proq ma'lumot
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Help and Information */}
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Auksionlar haqida ma'lumotlar</h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                            <div className="flex items-start mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                    <Info className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold">Qanday ishtirok etish mumkin?</h3>
                            </div>
                            <p className="text-gray-600">
                                Auksionlarda ishtirok etish juda oddiy. Ro'yxatdan o'ting, o'zingizni qiziqtirgan lotni tanlang va
                                taklif kiriting. Auksion yakunlangandan so'ng, agar g'olib bo'lsangiz, sizga bildirishnoma yuboriladi.
                            </p>
                            <a href="#" className="text-blue-600 hover:underline mt-4 inline-block">Batafsil ma'lumot</a>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                            <div className="flex items-start mb-4">
                                <div className="p-2 bg-green-100 rounded-lg mr-3">
                                    <Tag className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold">Qanday qilib sotuvchi bo'lish mumkin?</h3>
                            </div>
                            <p className="text-gray-600">
                                Sotuvchi bo'lish uchun "Sotuvchi kabineti" bo'limiga o'ting, ro'yxatdan o'ting va kerakli hujjatlarni
                                taqdim eting. Tekshiruv jarayoni tugagandan so'ng, siz o'z lotlaringizni joylashtira olasiz.
                            </p>
                            <a href="#" className="text-blue-600 hover:underline mt-4 inline-block">Batafsil ma'lumot</a>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                            <div className="flex items-start mb-4">
                                <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                                </div>
                                <h3 className="text-lg font-semibold">Xavfsiz savdo qoidalari</h3>
                            </div>
                            <p className="text-gray-600">
                                Xavfsiz savdo uchun biz barcha sotuvchilarni tekshiramiz va auksionlarni nazorat qilamiz.
                                Shuningdek, ishonchli to'lov tizimi va yetkazib berish xizmatlarini taqdim etamiz.
                            </p>
                            <a href="#" className="text-blue-600 hover:underline mt-4 inline-block">Batafsil ma'lumot</a>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <Link href='/about'>
                            <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition">
                                Ko'proq ma'lumot olish
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile App Download */}
            <div className="bg-white border-t border-gray-200 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-6 md:mb-0">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Auction mobil ilovasi orqali yanada qulay!</h2>
                            <p className="text-gray-600 mb-6">
                                Bizning mobil ilovamiz orqali istalgan joydan auksionlarga kiring, takliflar bering va yangi
                                lotlar haqida bildirishnomalar oling. iOS va Android qurilmalari uchun mavjud.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition">
                                    <ShoppingBag className="h-5 w-5" />
                                    <div>
                                        <div className="text-xs">Download on the</div>
                                        <div className="font-medium">App Store</div>
                                    </div>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition">
                                    <ShoppingBag className="h-5 w-5" />
                                    <div>
                                        <div className="text-xs">GET IT ON</div>
                                        <div className="font-medium">Google Play</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="md:w-1/2 flex justify-center">
                            <img
                                src="/mobile.png"
                                alt="Mobile App Screenshot"
                                className="h-64 md:h-80 rounded-xl shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* <footer className="footer">
                <div className="container">
                    <div className="footer-container">
                        <div>
                            <div className="footer-logo">Auction</div>
                            <p className="footer-description">
                                Eng ishonchli va qulay online auksion platformasi. Bizning maqsadimiz - xaridorlar va sotuvchilar o'rtasida sifatli va shaffof munosabatlarni ta'minlashdir.
                            </p>
                            <div style={{ display: "flex", gap: "15px" }}>
                                {["📱", "👥", "✉️", "📷"].map((icon, index) => (
                                    <a href="#" style={{ color: "var(--primary)", fontSize: "20px" }} key={index}>
                                        {icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="footer-title">Tezkor havolalar</h3>
                            <ul className="footer-links">
                                {["Bosh sahifa", "Auksionlar", "Biz haqimizda", "FAQ", "Sotish"].map((link, index) => (
                                    <li key={index}>
                                        <a href="#">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="footer-title">Kategoriyalar</h3>
                            <ul className="footer-links">
                                {["Ko'chmas mulk", "Transport", "Elektronika", "San'at asarlari", "Boshqa"].map((category, index) => (
                                    <li key={index}>
                                        <a href="#">{category}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="footer-title">Bog'lanish</h3>
                            {[
                                { icon: "📍", text: "Toshkent sh., Yunusobod tumani, 4-13" },
                                { icon: "✉️", text: "info@auction.uz" },
                                { icon: "📞", text: "+998 90 123 45 67" },
                                { icon: "⏱️", text: "Dush-Shan: 9:00 - 18:00" },
                            ].map((contact, index) => (
                                <div className="footer-contact" key={index}>
                                    <span>{contact.icon}</span> {contact.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2025 Auction - Barcha huquqlar himoyalangan</p>
                    </div>
                </div>
            </footer> */}
        </div >
    );
};