# Auksion tugagach sotuv/shartnoma moduli — LiveAuctionRoom ga ulash

## Fayllar

- `AuctionSaleModal.tsx` — sof UI. Hech qanday fetch qilmaydi, faqat props
  oladi va ko'rsatadi.
- `useUserById.ts` — sotuvchi/g'olibning ismi va telefonini olish uchun
  generic `GET /users/{id}` hook'i (`userGetById`ga mos).
- `useAuctionContract.ts` — faqat shartnoma tasdiqlash holati uchun (bu
  ikki tomonlama holat, boshqa joydan hisoblab bo'lmaydi, shuning uchun
  bittagina kichik backend endpoint kerak bo'lib qoladi).
- `AuctionSaleGate.tsx` — hammasini bir joyga yig'adigan konteyner
  component. **`LiveAuctionRoom.tsx` faqat shu componentni chaqiradi,
  boshqa hech narsa qo'shilmaydi.**

## LiveAuctionRoom.tsx ga qo'shiladigan yagona narsa

Import:

```tsx
import { AuctionSaleGate } from "@/components/auction/AuctionSaleGate";
```

JSX oxiriga (asosiy `return` ichida, `{confirmingBid ? (...) : null}` dan
keyin, eng tashqi `</div>` dan oldin):

```tsx
<AuctionSaleGate
  auctionId={auctionId}
  auction={auction}
  vehicleTitle={localizedTitle}
  highestBid={highestBid}
  bids={bids}
  userId={userId}
  locale={locale}
/>
```

Shu — boshqa hech qanday state, hook yoki helper `LiveAuctionRoom.tsx`
ichiga kirmaydi. Kim sotuvchi/g'olibligini aniqlash, foydalanuvchi
ma'lumotlarini olish va shartnoma tasdiqlash — barchasi `AuctionSaleGate`
ichida.

## AuctionSaleGate qanday ishlaydi

1. `auction.seller.id` — sotuvchi (to'g'ridan-to'g'ri, console.log'da
   tasdiqlangan real maydon).
2. G'olib — `highestBid.bidderId`, agar bo'sh bo'lsa `bids` ro'yxatidagi
   eng katta miqdorli taklifdan (`topBid`) zaxira sifatida olinadi.
3. `auction.status === "ended"` va g'olib mavjud bo'lsagina —
   `auctionSold = true`.
4. Joriy `userId` sotuvchi yoki g'olib ID'siga teng bo'lsa — `myRole` shu
   bo'yicha o'rnatiladi, aks holda `null` (modal umuman render bo'lmaydi).
5. `myRole` borligiga qarab ikkinchi tomonning ID'si aniqlanadi va
   `useUserById` orqali ismi/telefoni olinadi.
6. `useAuctionContract` — shartnoma holatini (`sellerConfirmed` /
   `buyerConfirmed`) oladi; `useConfirmAuctionContract` — joriy
   foydalanuvchi nomidan tasdiqlaydi.

## Backendda hali kerak bo'lishi mumkin bo'lgan narsa

Faqat bitta narsa: **shartnoma tasdiqlash holati**. Foydalanuvchi
ma'lumotlarini (`userGetById`) va g'olibni (`bidderId`) siz
aytganingizdek mavjud narsalardan olamiz, lekin "ikkala tomon ham
tasdiqladimi" degan holatni faqat backend biladi (ikkita alohida
sessiyada bir xil holatni ko'rish uchun). Shu sabab
`useAuctionContract.ts` ichida:

- `GET /auctions/{auctionId}/contract`
- `POST /auctions/{auctionId}/contract/confirm`

deb taxmin qilingan. Agar buning o'rniga kelajakda `auction` obyektiga
`sellerConfirmed`/`buyerConfirmed` maydonlari qo'shilsa (xuddi hozir
`finalPrice` borligi kabi, hali bo'sh bo'lsa ham), `useAuctionContract.ts`
faylidagi `GET` so'rovini olib tashlab, bu ikki maydonni to'g'ridan-to'g'ri
`auction`dan o'qib olsa bo'ladi — `AuctionSaleGate` faqat shu bittagina
joyni o'zgartirishni talab qiladi, `AuctionSaleModal` umuman tegilmaydi.

## Xavfsizlik eslatmasi

`useUserById` istalgan ID bo'yicha ism/telefon qaytaradi. Backendda bu
endpoint (yoki shu maqsadda ishlatiladigan alohida route) faqat
so'ragan foydalanuvchi haqiqatan ham o'sha auksionning sotuvchisi yoki
g'olibi bo'lgandagina, va faqat ikkinchi tomon haqida ma'lumot berishi
kerak — aks holda istalgan foydalanuvchi istalgan boshqa userning
telefon raqamini so'rab olishi mumkin bo'lib qoladi.
