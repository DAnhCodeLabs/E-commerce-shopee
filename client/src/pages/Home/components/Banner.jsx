import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { httpGet } from "../../../services/httpService";

const Banner = () => {
  const [banners, setBanners] = useState([]);

  const settings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await httpGet("/banners/active");
        const bannerList = response?.data;
        if (Array.isArray(bannerList)) setBanners(bannerList);
        else setBanners([]);
      } catch (err) {
        console.error("Lỗi tải banner:", err);
        setBanners([]);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-[1400px] h-[300px] mx-auto mt-10 relative">
      <div className="grid grid-cols-3 gap-3 h-full relative">
        <div className="col-span-2 relative h-full overflow-hidden">
          <Slider {...settings} className="!h-full">
            {banners.map((banner, i) => (
              <div key={i} className="h-[300px] outline-none">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            ))}
          </Slider>
        </div>
        <div className="col-span-1 flex flex-col justify-between">
          <div className="w-full h-[147px] mb-[6px]">
            <img
              className="w-full h-full object-cover rounded-md"
              src="https://down-vn.img.susercontent.com/file/sg-11134258-824g0-mfnvhzh6urdb5e@resize_w398_nl.webp"
              alt=""
            />
          </div>
          <div className="w-full h-[147px]">
            <img
              className="w-full h-full object-cover rounded-md"
              src="https://down-vn.img.susercontent.com/file/sg-11134258-824hv-mfm025jrwefgf5@resize_w398_nl.webp"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
