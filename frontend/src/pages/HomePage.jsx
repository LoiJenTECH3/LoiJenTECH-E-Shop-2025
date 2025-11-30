import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";

const categories = [
	{ href: "/processor", name: "Processor", imageUrl: "/cpu.jpg" },
	{ href: "/motherboard", name: "Motherboards", imageUrl: "/Motherboard.jpg" },
	{ href: "/ram", name: "Random Access Memory (RAM)", imageUrl: "/ram.jpg" },
	{ href: "/cooler", name: "CPU Coolers", imageUrl: "cooler.jpg" },
	{ href: "/ssd", name: "Solid State Drives (SSD)", imageUrl: "/ssd.jpg" },
	{ href: "/casing", name: "System Unit Casing", imageUrl: "/casing.jpg" },
	{ href: "/mouse", name: "Gaming Mouse", imageUrl: "/mouse.jpg" },	
	{ href: "/monitor", name: "Gaming Monitors", imageUrl: "/monitor.jpg" },
	{ href: "/keyboard", name: "Gaming Keyboards", imageUrl: "/keyboard.png" },
	
];

const HomePage = () => {
	const { fetchFeaturedProducts, products, isLoading } = useProductStore();

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

	return (
		<div className='relative min-h-screen text-white overflow-hidden'>
			<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
				<h1 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>
					Explore Our Tech Categories
				</h1>
				<p className='text-center text-xl text-gray-300 mb-12'>
					Unlock ultimate performance. Shop cutting-edge PC tech now!
				</p>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{categories.map((category) => (
						<CategoryItem category={category} key={category.name} />
					))}
				</div>

				{!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
			</div>
		</div>
	);
};
export default HomePage;
