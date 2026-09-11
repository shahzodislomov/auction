"use client"
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, MessageCircle, HelpCircle, Award, TrendingUp, ShieldCheck, CreditCard } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, toggleOpen }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <button
        onClick={toggleOpen}
        className="flex justify-between items-center w-full py-4 px-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
      >
        <h3 className="text-lg font-medium text-gray-800">{question}</h3>
        <span className="text-blue-500 ml-4">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>
      
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQCategory = ({ title, icon, description, faqs, activeCategory, setActiveCategory }) => {
  const isActive = activeCategory === title;
  
  return (
    <div 
      className={`cursor-pointer rounded-xl p-5 transition-all duration-300 ${
        isActive 
          ? 'bg-blue-100 border-blue-200 border text-blue-800' 
          : 'bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50'
      }`}
      onClick={() => setActiveCategory(title)}
    >
      <div className="flex items-center mb-3">
        <div className={`p-2 rounded-full mr-3 ${isActive ? 'bg-blue-200' : 'bg-gray-100'}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <p className={`text-sm ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
        {description}
      </p>
    </div>
  );
};

const FAQ = () => {
  const categories = [
    {
      id: 1,
      title: "Bid qilish",
      icon: <TrendingUp size={20} className="text-blue-600" />,
      description: "Auksionlarda ishtirok etish va bid qilish haqida ma'lumot"
    },
    {
      id: 2,
      title: "To'lovlar",
      icon: <CreditCard size={20} className="text-blue-600" />,
      description: "To'lov usullari va moliyaviy savollarga javoblar"
    },
    {
      id: 3,
      title: "Xavfsizlik",
      icon: <ShieldCheck size={20} className="text-blue-600" />,
      description: "Xavfsizlik va shaxsiy ma'lumotlar himoyasi bo'yicha savollarga javoblar"
    },
    {
      id: 4,
      title: "Sotuvchilar",
      icon: <Award size={20} className="text-blue-600" />,
      description: "Platformada sotuvchi sifatida ishlash bo'yicha ma'lumotlar"
    },
  ];

  const faqData = {
    "Bid qilish": [
      {
        id: 1,
        question: "Qanday qilib bid qilishim mumkin?",
        answer: "Platformamizda bid qilish uchun avval ro'yxatdan o'tishingiz kerak. Keyin, o'zingizni qiziqtirgan lot sahifasiga kirib, 'Bid qilish' tugmasini bosing va o'z narxingizni kiriting. Siz minimal qadamdan kam bo'lmagan miqdorni kiritishingiz kerak."
      },
      {
        id: 2,
        question: "Taklifimni o'zgartira olamanmi?",
        answer: "Yo'q, bir marta qo'yilgan bid o'zgartirilishi mumkin emas. Ammo, siz yangi va yuqoriroq bid qo'yishingiz mumkin. Shuning uchun har bir bid qilishdan oldin e'tibor bilan o'ylab ko'ring."
      },
      {
        id: 3,
        question: "Auksion tugagandan so'ng nima qilishim kerak?",
        answer: "Agar siz g'olib bo'lsangiz, sizga elektron pochta va SMS orqali bildirishnoma yuboriladi. Shundan so'ng, 3 kun ichida to'lovni amalga oshirishingiz kerak. To'lovni yakunlaganingizdan so'ng, sotuvchi bilan bog'lanib, tovarni olish tartibi haqida ma'lumot olasiz."
      }
    ],
    "To'lovlar": [
      {
        id: 1,
        question: "To'lov usullari qanday?",
        answer: "Platformamizda quyidagi to'lov usullarini qo'llab-quvvatlaymiz: bank kartasi (VISA, MasterCard, UzCard, HUMO), bank o'tkazmasi, Click va Payme to'lov tizimlari. To'lovni amalga oshirish uchun 'Mening hisobim' bo'limiga o'ting va 'Hisobni to'ldirish' tugmasini bosing."
      },
      {
        id: 2,
        question: "To'lov xavfsizligi qanday ta'minlanadi?",
        answer: "Barcha to'lovlar xavfsiz SSL shifrlash orqali amalga oshiriladi. Biz hech qachon sizning to'liq karta ma'lumotlaringizni saqlamaymiz. To'lovlar ishlov berish xalqaro standartlarga (PCI DSS) muvofiq amalga oshiriladi."
      },
      {
        id: 3,
        question: "Depozitni qaytarish qanday amalga oshiriladi?",
        answer: "Agar siz auksionning g'olibi bo'lmasangiz, sizning depozitingiz 24 soat ichida to'liq qaytariladi. Qaytarish to'lov amalga oshirilgan usul orqali bajariladi. Agar depozit qaytarilmasa, iltimos, qo'llab-quvvatlash xizmatiga murojaat qiling."
      }
    ],
    "Xavfsizlik": [
      {
        id: 1,
        question: "Platformada qanday xavfsizlik choralari mavjud?",
        answer: "Biz eng so'nggi xavfsizlik protokollarini qo'llaymiz, jumladan SSL shifrlash, ikki faktorli autentifikatsiya va muntazam xavfsizlik tekshiruvlari. Barcha foydalanuvchilar identifikatsiyadan o'tadi, bu esa firibgarlik xavfini kamaytiradi."
      },
      {
        id: 2,
        question: "Mening shaxsiy ma'lumotlarim qanday himoyalanadi?",
        answer: "Sizning ma'lumotlaringiz shifrlangan serverlarimizda saqlanadi va faqat platformani ishlashi uchun zarur bo'lgan xodimlarimiz kirishi mumkin. Biz ma'lumotlarni himoya qilish bo'yicha O'zbekiston qonunlariga qat'iy rioya qilamiz va uchinchi shaxslarga sizning ruxsatingizsiz ma'lumotlarni bermaymiz."
      },
      {
        id: 3,
        question: "Shubhali faoliyatni qanday xabar qilishim mumkin?",
        answer: "Agar siz shubhali faoliyatni ko'rsangiz, darhol 'Moderatorga xabar berish' tugmasini bosing yoki support@auction.uz manziliga yozing. Barcha xabarlar maxfiy ko'rib chiqiladi va zarur hollarda choralar ko'riladi."
      }
    ],
    "Sotuvchilar": [
      {
        id: 1,
        question: "Qanday qilib men sotuvchi bo'laman?",
        answer: "Sotuvchi bo'lish uchun 'Sotuvchi bo'lish' bo'limiga o'ting va ro'yxatdan o'tish jarayonini yakunlang. Shaxsiy ma'lumotlaringizni, bank rekvizitlaringizni kiriting va kerakli hujjatlarni yuklang. So'ngra, moderatorlarimiz ma'lumotlaringizni tekshiradi va tasdiqlagandan so'ng siz o'z tovarlaringizni sotishni boshlashingiz mumkin."
      },
      {
        id: 2,
        question: "Sotuvchi sifatida qanday komissiya to'layman?",
        answer: "Sotuvchilar uchun komissiya miqdori tovar kategoriyasiga qarab 5% dan 15% gacha o'zgaradi. Aniq komissiya stavkasi tovaringizni joylashtirish jarayonida ko'rsatiladi. Komissiya faqat muvaffaqiyatli savdo yakunlangandan so'ng olinadi."
      },
      {
        id: 3,
        question: "Tovarni qanday joylashtirishim mumkin?",
        answer: "Tovarni joylashtirishni 'Yangi lot yaratish' bo'limida amalga oshirasiz. Tovar nomini, batafsil tavsifini, kamida 3 ta sifatli rasmni, boshlang'ich narxni va minimal bid qadamini ko'rsating. Tovaringiz moderator tomonidan tekshirilgandan so'ng, u platformada ko'rinadi."
      }
    ]
  };

  const [openId, setOpenId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Bid qilish");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFaqs = searchTerm 
    ? Object.values(faqData).flat().filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqData[activeCategory];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-6xl mx-auto">
        {/* Header section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ko'p so'raladigan savollar
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Platformamiz haqida eng ko'p so'raladigan savollarga javoblar. Agar o'zingizni savolingizga javob topa olmasangiz, bizga murojaat qiling.
          </p>
        </div>
        
        {/* Search bar */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Savollarni qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Categories grid */}
        {!searchTerm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {categories.map((category) => (
              <FAQCategory
                key={category.id}
                {...category}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
              />
            ))}
          </div>
        )}
        
        {/* FAQ section */}
        <div className="mb-12">
          {searchTerm ? (
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              "{searchTerm}" bo'yicha qidiruv natijalari
            </h2>
          ) : (
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {activeCategory} bo'yicha savollar
            </h2>
          )}
          
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <FAQItem
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                isOpen={openId === faq.id}
                toggleOpen={() => toggleFaq(faq.id)}
              />
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <HelpCircle size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Savollar topilmadi. Boshqa so'zlarni qidirib ko'ring yoki bizga murojaat qiling.</p>
            </div>
          )}
        </div>
        
        {/* Need more help section */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Savolingizga javob topmadingizmi?
            </h2>
            <p className="text-gray-600 mb-6">
              Bizning qo'llab-quvvatlash xizmatimiz sizga yordam berishdan mamnun bo'ladi. Bizga qo'ng'iroq qiling, xat yozing yoki chatda murojaat qiling.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-5 rounded-lg">
                <div className="p-3 rounded-full bg-blue-100 inline-flex mb-3">
                  <MessageCircle size={24} className="text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Online chat</h3>
                <p className="text-sm text-gray-600 mb-3">Ish vaqtida onlayn yordamchimiz bilan suhbatlashing</p>
                <button className="text-blue-600 text-sm font-medium">
                  Chatni boshlash
                </button>
              </div>
              
              <div className="bg-blue-50 p-5 rounded-lg">
                <div className="p-3 rounded-full bg-blue-100 inline-flex mb-3">
                  <CreditCard size={24} className="text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Qo'llanma sahifalari</h3>
                <p className="text-sm text-gray-600 mb-3">Platformadan foydalanish bo'yicha batafsil ko'rsatmalar</p>
                <button className="text-blue-600 text-sm font-medium">
                  Qo'llanmani ko'rish
                </button>
              </div>
              
              <div className="bg-blue-50 p-5 rounded-lg">
                <div className="p-3 rounded-full bg-blue-100 inline-flex mb-3">
                  <MessageCircle size={24} className="text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Email orqali</h3>
                <p className="text-sm text-gray-600 mb-3">Bizga xat yozing, 24 soat ichida javob beramiz</p>
                <button className="text-blue-600 text-sm font-medium">
                  support@auction.uz
                </button>
              </div>
            </div>
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md transition-colors duration-300">
              Bizga murojaat qiling
            </button>
          </div>
        </div>
        
        {/* Popular articles section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Foydali maqolalar
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Auksionlarda ishtirok etish bo'yicha qo'llanma",
                description: "Platformada muvaffaqiyatli ishtirok etish uchun bosqichma-bosqich ko'rsatmalar",
                link: "#"
              },
              {
                title: "Xavfsiz savdo qilish qoidalari",
                description: "Platformada xavfsiz savdo qilish va firibgarlikdan himoyalanish bo'yicha maslahatlar",
                link: "#"
              },
              {
                title: "Sotuvchilar uchun platformadan foydalanish bo'yicha qo'llanma",
                description: "Sotuvchi sifatida ro'yxatdan o'tish va tovarlarni samarali sotish bo'yicha maslahatlar",
                link: "#"
              }
            ].map((article, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
                <h3 className="font-semibold text-lg mb-2 text-blue-800">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {article.description}
                </p>
                <a href={article.link} className="text-blue-600 font-medium text-sm flex items-center">
                  Batafsil o'qish
                  <ChevronDown size={16} className="ml-1 rotate-270" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;