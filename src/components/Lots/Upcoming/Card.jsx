import React from 'react'
import { Bell, Calendar, Clock, Users } from 'lucide-react';

export default function Card({auction}) {
    return (
        <div key={auction.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition group">
            <div className="relative">
                <img
                    src={auction?.lotImageDtoList?.[0]?.imageUrl}
                    alt={auction.title}
                    className="w-full h-48 object-cover object-center group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-2 right-2">
                    <div className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Tez kunda</span>
                    </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg drop-shadow-sm">{auction.title}</h3>
                    <p className="text-white/90 text-sm drop-shadow-sm">{auction.description}</p>
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{auction.category}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{auction.watchers} kuzatuvchilar</span>
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Boshlang'ich narx</div>
                        <div className="text-lg font-bold text-blue-600">{auction?.startPrice?.toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-500 mb-1">Boshlanish vaqti</div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{auction.startDate}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-1">
                    <Bell className="h-4 w-4" />
                    <span>Eslatma qo'shish</span>
                </button>
            </div>
        </div>
    )
}
