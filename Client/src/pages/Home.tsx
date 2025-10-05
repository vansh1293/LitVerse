import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { isAuthenticated } from "../lib/auth";

export default function Home() {
    const navigate = useNavigate();

    const handleExplore = () => {
        if (isAuthenticated()) {
            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
            {/* Animated Glow Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-44 h-44 sm:w-[300px] sm:h-[300px] bg-purple-600/20 blur-3xl rounded-full -top-6 -left-6 sm:-top-10 sm:-left-10 animate-pulse" />
                <div className="absolute w-56 h-56 sm:w-[400px] sm:h-[400px] bg-blue-500/20 blur-3xl rounded-full top-1/3 right-6 sm:right-10 animate-pulse" />
                <div className="absolute w-36 h-36 sm:w-[250px] sm:h-[250px] bg-indigo-500/20 blur-2xl rounded-full bottom-0 left-6 sm:left-1/4 animate-pulse" />
            </div>

            {/* Center Card */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="relative z-10 bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-10 text-center shadow-2xl border border-white/10 max-w-md sm:max-w-xl mx-4 sm:mx-0"
            >
                <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-snug">
                    <span className="block text-white/90">Welcome to</span>
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-400 bg-clip-text text-transparent font-serif tracking-wide">
                        LitVerse
                    </span>
                </h1>

                <p className="text-gray-300/90 text-lg mb-10 italic font-light max-w-md mx-auto leading-relaxed">
                    “Where every page whispers a story waiting to be heard.”
                </p>

                <motion.button
                    onClick={handleExplore}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 sm:px-10 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-full text-white font-semibold text-md sm:text-lg shadow-lg hover:shadow-purple-600/40 transition-all duration-300"
                >
                    Explore
                </motion.button>
            </motion.div>
        </div>
    );
}
