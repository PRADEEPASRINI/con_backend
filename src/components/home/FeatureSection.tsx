import React from "react";
import { Link } from "react-router-dom";

interface FeatureSectionProps {
  title: string;
  description: string;
  imageSrc: string;
  linkTo: string;
  imagePosition?: "left" | "right";
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  description,
  imageSrc,
  linkTo,
  imagePosition = "left",
}) => {
  const isImageLeft = imagePosition === "left";

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12 md:flex-row md:items-stretch">
          {/* Image Section */}
          <div className={`md:w-1/2 ${isImageLeft ? "md:order-1" : "md:order-2"}`}>
            <div className="relative h-full w-full overflow-hidden rounded-lg shadow-lg">
              <img
                src={imageSrc}
                alt={title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white">{title}</h3>
                <Link
                  to={linkTo}
                  className="mt-3 inline-block text-white underline hover:text-gray-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className={`md:w-1/2 ${isImageLeft ? "md:order-2" : "md:order-1"}`}>
            <div className="flex h-full flex-col justify-center">
              <h2 className="mb-4 text-3xl font-bold text-white">{title}</h2>
              <p className="mb-6 text-lg text-gray-300">{description}</p>
              <Link
                to={linkTo}
                className="inline-flex w-fit items-center rounded-md bg-white px-4 py-2 text-black font-medium hover:bg-gray-200 transition-colors"
              >
                Explore {title}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
