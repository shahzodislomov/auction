import React, { useRef, useState } from "react";
import Slider from "react-slick";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import "slick-carousel/slick/slick.css"; // Import default slick CSS
import "slick-carousel/slick/slick-theme.css"; // Import slick theme CSS
import placeholderImg from '@/assets/placeholder-image.jpg'
import { FormattedMessage } from "react-intl";


export default function SimpleSlider({ data }) {
    const router = useRouter();
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef(null); // Reference for Slider

    // Custom Prev Button
    const PrevButton = ({ onClick }) => (
        <button
            className=" p-2 absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 duration-100 text-white rounded-full z-10 hover:bg-black/50 flex justify-center items-center"
            onClick={onClick}
        >
            <ChevronLeft />
        </button>
    );

    // Custom Next Button
    const NextButton = ({ onClick }) => (
        <button
            className=" p-2 absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 duration-100 text-white rounded-full z-10 hover:bg-black/50 flex justify-center items-center"
            onClick={onClick}
        >
            <ChevronRight />
        </button>
    );

    // Slider settings
    const settings = {
        dots: true, // Enable indicator dots
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false, // Disable autoplay
        pauseOnHover: false,
        arrows: false, // Hide default arrows
        swipe: false, // Disable swipe on mobile
        draggable: false, // Disable drag on desktop
        appendDots: (dots) => (
            <div
                style={{
                    position: "absolute",
                    bottom: "20px", // Adjust this value to control vertical position
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    zIndex: 20,
                }}
            >
                <ul style={{ margin: 0, padding: 0 }}>{dots}</ul>
            </div>
        ),
        customPaging: () => (
            <div className="w-3 h-3 bg-gray-400 rounded-full transition-all duration-300 hover:bg-gray-600"></div>
        ),
        beforeChange: () => setIsDragging(true),
        afterChange: () => setIsDragging(false),
    };

    // Handle single banner case
    const lots = Array.isArray(data) && data.length > 0 ? data : [];
    const displayLots = lots.length === 1 ? Array(3).fill(lots[0]) : lots;

    return (
        <div className="relative overflow-hidden z-0 rounded-md">
            {/* Slider Component */}
            <Slider ref={sliderRef} {...settings}>
                {displayLots.map((lot, index) => {
                    const calculateBidAmount = (lot) => {
                        const startPrice = lot?.lotDto?.startPrice || 0;
                        const incrementValue = lot?.lotDto?.incrementValue || 0;
                        const incrementType = lot?.lotDto?.incrementType;

                        if (incrementType === "FIXED") {
                            // For FIXED increment type, add incrementValue directly
                            return startPrice + incrementValue;
                        } else if (incrementType === "PERCENTAGE") {
                            // For PERCENTAGE increment type, calculate percentage of startPrice
                            return startPrice + (startPrice * incrementValue) / 100;
                        } else {
                            // Default to startPrice if incrementType is invalid or missing
                            return startPrice;
                        }
                    };

                    // Example usage
                    const bidAmount = calculateBidAmount(lot); return (
                        < div
                            key={index} // Use index as key since we're duplicating the single banner
                            className="flex flex-col md:flex-row bg-black text-white rounded-lg overflow-hidden"
                        >
                            {/* Main Image */}
                            < div className="relative flex-grow" >
                                <div
                                    onMouseDown={() => setIsDragging(false)}
                                    onMouseUp={(e) => {
                                        if (!isDragging && e.target.tagName !== "BUTTON") {
                                            router.push(`/lots/${lot?.lotDto?.id}`);
                                        }
                                    }}
                                >
                                    <img
                                        src={lot.bannerUrl || placeholderImg}
                                        alt={lot.id}
                                        className="w-full h-[30vh] md:h-[70vh] object-cover"
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 to-transparent"></div>
                                    {/* Info Section */}
                                    <div className="absolute top-4 left-4 space-y-2">
                                        <span className="bg-gray-700 text-sm px-3 py-1 rounded-md uppercase">
                                            <FormattedMessage id="featured" />
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                                        {/* Current Bid */}
                                        <div className="bg-blue-600 text-sm px-3 py-1 rounded-md">
                                            <FormattedMessage id="bid" /> {bidAmount.toLocaleString()} UZS
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div >
                    )
                })}
            </Slider >

            {/* Custom Prev/Next Buttons */}
            {
                lots.length > 1 && ( // Only show buttons if there are multiple banners
                    <>
                        <PrevButton onClick={() => sliderRef.current?.slickPrev()} />
                        <NextButton onClick={() => sliderRef.current?.slickNext()} />
                    </>
                )
            }
        </div >
    );
}