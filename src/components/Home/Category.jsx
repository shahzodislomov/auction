import React from "react";
import { useLotTypes } from "@/queries/lot-types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormattedMessage, useIntl } from "react-intl"; // Import useIntl for localization
import { CardContent, CardMedia, Grid, Typography } from "@mui/material";

export default function Category() {
    const { data } = useLotTypes();
    const router = useRouter();
    const { locale } = useIntl(); // Get the current locale


    // Function to parse and localize the name
    const getLocalizedName = (name) => {
        try {
            const parsedName = name;
            return parsedName[locale] || parsedName.en || "Unknown";
        } catch (error) {
            return "Unknown";
        }
    };


    const handleCategoryClick = (type) => {
        try {
            const parsedName = type.name;
            const englishName = parsedName.en || "unknown"; // Always use English in URLs
            router.push(`/auctions?lotType=${encodeURIComponent(englishName)}`);
        } catch (error) {
            console.error("Error parsing lot type name:", error);
        }
    };



    return (
        // <div className="bg-gray-100 p-6 rounded-md shadow-md">
        //     <h1 className="text-2xl font-semibold px-4"><FormattedMessage id="lotTypes" /></h1>

        //     <Grid container spacing={4} mt={1}>
        //         {data?.map((type, id) => (
        //             <Grid item xs={12} sm={6} md={4} lg={3} key={id}>
        //                 <div
        //                     className="shadow-lg rounded-md flex justify-around bg-primary-light items-center text-white py-2 cursor-pointer"
        //                     onClick={() => handleCategoryClick(type)} // Call function on click
        //                 >
        //                     <CardContent>
        //                         <Typography variant="h5" component="div" className="font-bold mb-2">
        //                             {getLocalizedName(type.name)} {/* Display localized name */}
        //                         </Typography>
        //                         <Typography variant="body2" color="text.white">
        //                             {type.description}
        //                         </Typography>
        //                     </CardContent>
        //                     <CardMedia
        //                         component="img"
        //                         image={type.imageUrl}
        //                         alt={type.name}
        //                         sx={{ objectFit: "cover", height: 70, width: 70 }}
        //                         className="rounded-full bg-white"
        //                     />
        //                 </div>
        //             </Grid>
        //         ))}
        //     </Grid>
        // </div>
        // <section className="section">
        //     <div className="container">
        //         <h2 className="section-title">Auksion lot turlari</h2>

        //         <div className="filter-tabs">
        //             <div className="filter-tab active">Barcha kategoriyalar</div>
        //             <div className="filter-tab">Ko'chmas mulk</div>
        //             <div className="filter-tab">Transport</div>
        //             <div className="filter-tab">Elektronika</div>
        //             <div className="filter-tab">Antika</div>
        //             <div className="filter-tab">San'at</div>
        //         </div>

        //         <div className="categories">
        //             <div className="category-card">
        //                 <div className="category-image">
        //                     <img src="https://i.pinimg.com/736x/92/71/92/927192164f14ab807be81e826d2baa93.jpg" alt="Ko'chmas mulk" />
        //                 </div>
        //                 <div className="category-content">
        //                     <h3>Ko'chmas mulk</h3>
        //                     <p>Uylar, kvartiralar, savdo binolari va boshqa ko'chmas mulk uchun auksionlar</p>
        //                     <span className="category-badge">300+ aktiv lot</span>
        //                 </div>
        //             </div>

        //             <div className="category-card">
        //                 <div className="category-image">
        //                     <img src="https://i.pinimg.com/originals/23/98/98/239898f20bf61903d9ca439e0943a5d7.png" alt="Transport" />
        //                 </div>
        //                 <div className="category-content">
        //                     <h3>Transport</h3>
        //                     <p>Avtomobillar, yuk mashinalari va boshqa transport vositalari</p>
        //                     <span className="category-badge">150+ aktiv lot</span>
        //                 </div>
        //             </div>

        //             <div className="category-card">
        //                 <div className="category-image">
        //                     <img src="https://i.pinimg.com/736x/51/d3/88/51d38806d50482762c700eca5717a32f.jpg" alt="Elektronika" />
        //                 </div>
        //                 <div className="category-content">
        //                     <h3>Elektronika</h3>
        //                     <p>Telefonlar, kompyuterlar va boshqa elektron jihozlar</p>
        //                     <span className="category-badge">200+ aktiv lot</span>
        //                 </div>
        //             </div>

        //             <div className="category-card">
        //                 <div className="category-image">
        //                     <img src="https://i.pinimg.com/736x/1c/bc/54/1cbc54f47c0a69f6ab0a0730885d887a.jpg" alt="San'at asarlari" />
        //                 </div>
        //                 <div className="category-content">
        //                     <h3>San'at asarlari</h3>
        //                     <p>Suratlari, haykallari va boshqa san'at asarlari</p>
        //                     <span className="category-badge">80+ aktiv lot</span>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </section>
  <section className="py-16">
    <div className="mx-auto max-w-7xl px-5">
      <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
        Auksion lot turlari
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.map((type) => (
          <div
            key={type.id}
            onClick={() => handleCategoryClick(type)}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-xl"
          >
            <div className="h-52 overflow-hidden bg-gray-100">
              <img
                src={type.imageUrl}
                alt={getLocalizedName(type.name)}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
            </div>

            <div className="p-5">
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {getLocalizedName(type.name)}
              </h3>

              <p className="mb-4 line-clamp-2 text-sm leading-6 text-gray-600">
                {type.description}
              </p>

              <div className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                <FormattedMessage id="viewLots" defaultMessage="Lotlarni ko'rish" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
    );
}