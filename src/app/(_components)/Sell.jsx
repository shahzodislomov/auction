import React from 'react';
import { ShoppingBag, Shield, Clock, Award, Users, TrendingUp, CheckCircle } from 'lucide-react';
import  Link  from 'next/link';

export default function SellPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white mt-16">
      {/* Hero Section */}
      <section className="pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">Buyumlaringizni sotishga tayyormisiz?</h1>
            <p className="text-lg text-gray-600 mb-8">
              Ishonchli auksion platformamiz orqali buyumlaringizni sotishni boshlang va eng yaxshi narxlarni oling. Bu oson, xavfsiz va foydali.
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-lg">
                Hozir ro'yxatdan o'tkazish
              </button>
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium border border-blue-600 hover:bg-blue-50 transition">
                Ko'proq ma'lumot
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Bizning auksion saytimizda sotishning afzalliklari</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Keng qamrov</h3>
              <p className="text-gray-600">
                Global auditoriyaga yeting va eng yuqori narx taklif qiluvchiga soting. Mijozlar bazangizni kengaytiring va raqobatbardosh narxlarni oling.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Xavfsiz to'lovlar</h3>
              <p className="text-gray-600">
                Xavfsiz va ishonchli to'lov tizimi bilan xotirjam bo'ling. Sizning manfaatlaringizni himoya qilish uchun hamma narsani biz hal qilamiz.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Oson ro'yxatga olish</h3>
              <p className="text-gray-600">
                Bir necha daqiqada ro'yxatni yarating! Bizning oddiy va foydalanish uchun qulay platformamiz bilan buyumlaringizni ro'yxatga olish tez va muammosiz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Bu qanday ishlaydi</h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Ro'yxatdan o'ting</h3>
              <p className="text-gray-600">Bepul hisobingizni yarating va shaxsiy profilingizni sozlang</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Buyumni qo'shing</h3>
              <p className="text-gray-600">Mahsulotingizni sifatli fotosuratlar va batafsil tavsif bilan ro'yxatga oling</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Auksionni boshqaring</h3>
              <p className="text-gray-600">Takliflarni kuzatib boring va potensial xaridorlar bilan muloqot qiling</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-xl font-semibold mb-2">Pulingizni oling</h3>
              <p className="text-gray-600">Auksion yakunlangandan so'ng to'lovni xavfsiz va tez qabul qiling</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Eng ommabop kategoriyalar</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 text-center">
              <div className="bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-medium">Antikvar buyumlar</h3>
            </div>

            <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 text-center">
              <div className="bg-green-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-medium">Elektronika</h3>
            </div>

            <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 text-center">
              <div className="bg-purple-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Award className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-medium">Zargarlik buyumlari</h3>
            </div>

            <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 text-center">
              <div className="bg-yellow-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-medium">Kolleksion narsalar</h3>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Buyumingizni ro'yxatga olishga tayyormisiz?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Bugun ro'yxatga qo'shing va minglab potensial xaridorlar bilan bog'laning</p>
          <Link href='/dashboard/createlot'>
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-lg">
              Lot yaratish
            </button>
          </Link>
          <div className="mt-8 text-blue-100">Savollaringiz bormi? Bizga +998 90 123 45 67 raqamiga qo'ng'iroq qiling</div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Mijozlarimiz nima deyishadi</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">AA</span>
                </div>
                <div>
                  <h4 className="font-semibold">Anvar Akbarov</h4>
                  <p className="text-gray-500 text-sm">Toshkent</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"Men antikvar soatimni bu platformada sotdim va kutganimdan yuqori narx oldim. Jarayon juda oson edi, albatta yana foydalanaman!"</p>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-bold">MK</span>
                </div>
                <div>
                  <h4 className="font-semibold">Malika Karimova</h4>
                  <p className="text-gray-500 text-sm">Samarqand</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"Zargarlik buyumlarimni sotish uchun ideal joy. To'lov tizimi xavfsiz va mijozlar xizmati a'lo darajada. Albatta tavsiya qilaman!"</p>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-orange-600 font-bold">BT</span>
                </div>
                <div>
                  <h4 className="font-semibold">Bobur Toshmatov</h4>
                  <p className="text-gray-500 text-sm">Namangan</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"Bir oyda o'ndan ortiq lotlarni muvaffaqiyatli sotdim. Platform intuitiv va foydalanish uchun qulay, komissiya narxlari ham juda adolatli."</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Ko'p so'raladigan savollar</h2>

          <div className="max-w-3xl mx-auto">
            <div className="mb-6 bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Ro'yxatga olish uchun qancha to'lashim kerak?</h3>
              <p className="text-gray-600">Platformamizda hisobingizni yaratish va buyumlarni ro'yxatga olish bepul. Faqat muvaffaqiyatli sotuvdan keyin kichik komissiya to'lanadi.</p>
            </div>

            <div className="mb-6 bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Qancha vaqt ichida to'lovni qabul qilaman?</h3>
              <p className="text-gray-600">Xaridor to'lovni amalga oshirgandan so'ng, odatda 1-3 ish kuni ichida pullar hisobingizga o'tkaziladi.</p>
            </div>

            <div className="mb-6 bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Qanday turdagi buyumlarni sotishim mumkin?</h3>
              <p className="text-gray-600">Siz elektronika, antikvar buyumlar, zargarlik buyumlari, san'at asarlari, kolleksion narsalar va boshqa ko'plab kategoriyalarga oid buyumlarni sota olasiz. Noqonuniy yoki taqiqlangan tovarlar qabul qilinmaydi.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Auksion qancha vaqt davom etadi?</h3>
              <p className="text-gray-600">Siz auksioningiz davomiyligini 3 kundan 14 kungacha sozlashingiz mumkin. Shuningdek, "hoziroq sotib olish" narxini belgilash imkoniyati ham mavjud.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Hoziroq sotishni boshlang</h2>
          <Link href='/dashboard/createlot'>
            <button className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg">
              Lot yaratish
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
   
    </div>
  );
}