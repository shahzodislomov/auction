import React from "react";
import { motion } from "framer-motion";
import { People, Gavel, PlayCircle, CheckCircle } from "@mui/icons-material";
import { FormattedMessage } from "react-intl";

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const SiteStats = ({ lotStats, userStats }) => {

    return (
        // <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        //     <h1 className="text-2xl font-semibold px-4 text-gray-700"><FormattedMessage id="stats" /></h1>
        //     <motion.div
        //         className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mt-5"
        //         initial="hidden"
        //         animate="visible"
        //         variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        //     >
        //         <motion.div variants={cardVariants} className="bg-primary-light text-white py-6 px-2 md:px-6 rounded-lg shadow-md flex  items-center justify-around">
        //             <People fontSize="large" />
        //             <div className="">
        //                 <h3 className="text-3xl font-bold">{userStats?.allUsersCount || 0}</h3>
        //                 <p className="text-sm opacity-80"><FormattedMessage id="allUsers" /></p>
        //             </div>
        //         </motion.div>

        //         <motion.div variants={cardVariants} className="bg-primary-light text-white py-6 px-2 md:px-6 rounded-lg shadow-md flex  items-center justify-around">
        //             <Gavel fontSize="large" />
        //             <div className="">
        //                 <h3 className="text-3xl font-bold">{lotStats?.allLotsCount || 0}</h3>
        //                 <p className="text-sm opacity-80"><FormattedMessage id="allLots" /></p>
        //             </div>
        //         </motion.div>

        //         <motion.div variants={cardVariants} className="bg-primary-light text-white py-6 px-2 md:px-6 rounded-lg shadow-md flex  items-center justify-around">
        //             <PlayCircle fontSize="large" />
        //             <div className="">
        //                 <h3 className="text-3xl font-bold">{lotStats?.activeLotsCount || 0}</h3>
        //                 <p className="text-sm opacity-80"><FormattedMessage id="allActiveLots" /></p>
        //             </div>
        //         </motion.div>

        //         <motion.div variants={cardVariants} className="bg-primary-light text-white py-6 px-2 md:px-6 rounded-lg shadow-md flex  items-center justify-around">
        //             <CheckCircle fontSize="large" />
        //             <div className="">
        //                 <h3 className="text-3xl font-bold">{lotStats?.finishedLotsCount || 0}</h3>
        //                 <p className="text-sm opacity-80"><FormattedMessage id="allFinishedLots" /></p>
        //             </div>
        //         </motion.div>
        //     </motion.div>
        // </div>
        <section className="stats">
            <div className="container">
                <div className="stats-container">
                    <div className="stat-item">
                        <h3>{userStats?.allUsersCount || 0}+</h3>
                        <p><FormattedMessage id="allUsers" /></p>
                    </div>
                    <div className="stat-item">
                        <h3>{lotStats?.activeLotsCount || 0}+</h3>
                        <p><FormattedMessage id="allActiveLots" /></p>
                    </div>
                    <div className="stat-item">
                        <h3>{lotStats?.finishedLotsCount || 0}+</h3>
                        <p><FormattedMessage id="allFinishedLots" /></p>
                    </div>
                    <div className="stat-item">
                        <h3>{lotStats?.allLotsCount || 0}+</h3>
                        <p><FormattedMessage id="allLots" /></p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SiteStats;
