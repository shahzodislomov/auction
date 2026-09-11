import { Calendar, ChevronRight } from 'lucide-react';
import React from 'react'
import Card from './Card';

export default function Upcoming() {

  const upcomingAuctions = [
    {
      id: 7,
      title: 'Macbook Pro M2',
      description: 'Apple Macbook Pro 16" 2023',
      lotImageDtoList: [
        {
          imageUrl: 'https://www.thestreet.com/.image/t_share/MTk1MzY2NjE1NDAxODk5NzA3/2-14-inch-macbook-pro-with-m2-pro-chip-review.jpg',
        }
      ],
      category: 'Elektronika',
      startPrice: '15,000,000 UZS',
      startDate: '15.04.2026 10:00',
      seller: 'iShop',
      watchers: 42
    },
    {
      id: 8,
      title: 'Gentra',
      description: 'Chevrolet Gentra 2023, Premier',
      lotImageDtoList: [
        {
          imageUrl: 'https://www.autostat.ru/application/includes/blocks/big_photo/images/cache/000/120/892/353b1ea2-670-0.jpg',
        }
      ],
      category: 'Transport',
      startPrice: '140,000,000 UZS',
      startDate: '18.04.2026 12:00',
      seller: 'UzAuto Motors',
      watchers: 63
    },
    {
      id: 9,
      title: 'Samsung QLED TV',
      description: 'Samsung 65" Q80C 4K QLED',
      lotImageDtoList: [
        {
          imageUrl: 'https://yella.uz/image/cache/catalog/yellauz/products/november-2023/100151(1)/QE55Q70CAUXUZ/dg32456-700x700.jpg',
        }
      ],
      category: 'Elektronika',
      startPrice: '12,000,000 UZS',
      startDate: '16.04.2026 14:30',
      seller: 'Samsung Store',
      watchers: 29
    }
  ];
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Calendar className="h-5 w-5 text-purple-500 mr-2" />
          Yaqinlashib kelayotgan auksionlar
        </h3>
        <a href="#" className="text-blue-600 hover:underline text-sm flex items-center">
          <span>Barchasini ko'rish</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {upcomingAuctions?.map(auction => (
          <Card auction={auction} key={auction.id}/>
        ))}
      </div>
    </div>
  )
}
