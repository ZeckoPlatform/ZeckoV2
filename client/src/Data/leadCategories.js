// client/src/data/jobCategories.js

import { 
  FaHardHat, FaBriefcase, FaBroom, FaHome, FaWrench, 
  FaCar, FaPaw, FaBuilding, FaHeart, FaCamera, 
  FaLaptop, FaPaintBrush, FaTree, FaMusic, FaShoppingBag, 
  FaPlane, FaSpa, FaUtensils, FaDumbbell, FaTools, 
  FaTruck, FaLeaf, FaCut, FaGavel, FaMedkit, 
  FaGraduationCap, FaPalette, FaTheaterMasks, FaVideo, 
  FaUserTie, FaChalkboardTeacher, FaHandsHelping, FaStore, 
  FaWarehouse, FaIndustry, FaShieldAlt, FaFlask
} from 'react-icons/fa';

export const jobCategories = {
  "Construction & Building": {
    name: "Construction & Building",
    icon: FaHardHat,
    description: "Professional construction, renovation, and building services for residential, commercial, and industrial projects",
    subcategories: [
      "General Contractors",
      "Architects",
      "Structural Engineers",
      "Electricians",
      "Plumbers",
      "Carpenters",
      "Bricklayers",
      "Plasterers",
      "Painters & Decorators",
      "Roofers",
      "Flooring Specialists",
      "HVAC Engineers",
      "Glaziers",
      "Scaffolders",
      "Foundation Specialists",
      "Steel Fixers",
      "Concrete Specialists",
      "Drywall Contractors",
      "Insulation Installers",
      "Building Surveyors",
      "Project Managers",
      "Site Managers",
      "Construction Equipment Operators",
      "Demolition Specialists",
      "Environmental Consultants",
      "Asbestos Removal",
      "Solar Panel Installers",
      "Waterproofing Specialists",
      "Stonemasonry",
      "Timber Frame Specialists",
      "Fire Protection Services",
      "Building Automation Specialists",
      "Crane Operators",
      "Civil Engineers",
      "Quantity Surveyors"
    ]
  },
  "Professional Services": {
    name: "Professional Services",
    icon: FaBriefcase,
    description: "Expert professional, legal, and consulting services for individuals and businesses of all sizes",
    subcategories: [
      "Lawyers & Solicitors",
      "Accountants",
      "Financial Advisors",
      "Business Consultants",
      "Tax Consultants",
      "Estate Agents",
      "Property Surveyors",
      "Insurance Brokers",
      "Mortgage Advisors",
      "Investment Advisors",
      "Patent Attorneys",
      "Notaries",
      "HR Consultants",
      "Management Consultants",
      "Marketing Consultants",
      "PR Specialists",
      "Business Coaches",
      "Risk Assessors",
      "Forensic Accountants",
      "Actuaries",
      "Corporate Trainers",
      "Business Analysts",
      "Wealth Managers",
      "Immigration Consultants",
      "Economic Advisors",
      "Data Protection Officers",
      "Compliance Consultants",
      "Environmental Consultants",
      "Energy Assessors",
      "Procurement Specialists",
      "Bid Writers",
      "Grant Writers",
      "Corporate Investigators",
      "Expert Witnesses",
      "Mediators"
    ]
  },
  "Home Improvement": {
    name: "Home Improvement",
    icon: FaHome,
    description: "Comprehensive home renovation and improvement services for interior and exterior transformations",
    subcategories: [
      "Bathroom Installation",
      "Kitchen Installation",
      "Carpentry & Joinery",
      "Painting & Decorating",
      "Plastering & Rendering",
      "Flooring Installation",
      "Tiling",
      "Windows & Doors",
      "Handyman Services",
      "Electrical Installation",
      "Plumbing",
      "Roofing",
      "Guttering & Fascias",
      "Conservatories & Orangeries",
      "Loft Conversions",
      "Extensions & Conversions",
      "Garage Conversions",
      "Insulation Installation",
      "Damp Proofing",
      "Structural Work",
      "Smart Home Installation",
      "Home Theater Setup",
      "Custom Furniture Making",
      "Cabinet Making",
      "Staircase Installation",
      "Soundproofing",
      "Basement Conversion",
      "Garden Room Construction",
      "Accessibility Modifications",
      "Energy Efficiency Upgrades"
    ]
  },
  "Wedding Services": {
    name: "Wedding Services",
    subcategories: [
      "Wedding Photography",
      "Wedding Videography",
      "Wedding Venues",
      "Wedding Catering",
      "Wedding Planning",
      "Wedding Cars",
      "Wedding Flowers",
      "Wedding Cakes",
      "Wedding Dresses",
      "Wedding Entertainment",
      "Bridal Hair & Makeup",
      "Wedding Decorations",
      "Wedding Invitations",
      "Wedding DJ",
      "Wedding Band",
      "Wedding Favours",
      "Wedding Rings",
      "Bridesmaids Dresses",
      "Wedding Suit Hire",
      "Wedding Accessories"
    ]
  },
  "Health & Beauty": {
    name: "Health & Beauty",
    subcategories: [
      "Hairdressing",
      "Beauty Therapy",
      "Massage Therapy",
      "Nail Treatment",
      "Personal Training",
      "Yoga Classes",
      "Pilates Classes",
      "Nutrition Advice",
      "Physiotherapy",
      "Chiropractor",
      "Osteopathy",
      "Dental Services",
      "Alternative Medicine",
      "Counselling",
      "Life Coaching",
      "Weight Loss Services",
      "Meditation Classes",
      "Sports Massage",
      "Acupuncture",
      "Spa Services"
    ]
  },
  "Events & Entertainment": {
    name: "Events & Entertainment",
    subcategories: [
      "Event Planning",
      "DJs",
      "Live Bands",
      "Photographers",
      "Videographers",
      "Catering Services",
      "Event Decoration",
      "Party Planning",
      "Corporate Events",
      "Children's Entertainment",
      "Magicians",
      "Face Painting",
      "Balloon Artists",
      "Mobile Bars",
      "Event Staff",
      "Event Equipment Hire",
      "Photo Booth Hire",
      "Marquee Hire",
      "Sound & Lighting Hire",
      "Stage Hire"
    ]
  },
  "Home Services": {
    name: "Home Services",
    subcategories: [
      "House Cleaning",
      "Window Cleaning",
      "Carpet Cleaning",
      "Garden Maintenance",
      "Lawn Care",
      "Tree Surgery",
      "Pest Control",
      "Waste Removal",
      "House Removals",
      "Man & Van Services",
      "Storage Services",
      "Pool Maintenance",
      "Appliance Repair",
      "Locksmith",
      "Security Systems",
      "Chimney Sweeping",
      "Pressure Washing",
      "Gutter Cleaning",
      "Drain Cleaning",
      "Furniture Assembly"
    ]
  },
  "Education & Training": {
    name: "Education & Training",
    subcategories: [
      "Private Tutoring",
      "Language Lessons",
      "Music Lessons",
      "Art Classes",
      "Dance Classes",
      "Driving Lessons",
      "Swimming Lessons",
      "Sports Coaching",
      "Business Training",
      "IT Training",
      "First Aid Training",
      "Adult Education",
      "School Support",
      "Special Needs Support",
      "Exam Preparation",
      "Professional Qualifications",
      "Vocational Training",
      "Life Skills Training",
      "Personal Development",
      "Educational Assessment"
    ]
  },
  "Automotive": {
    name: "Automotive",
    subcategories: [
      "Car Servicing",
      "Car Repairs",
      "MOT Testing",
      "Car Valeting",
      "Mobile Mechanics",
      "Breakdown Recovery",
      "Tire Fitting",
      "Vehicle Diagnostics",
      "Car Body Repairs",
      "Car Paint Work",
      "Car Electronics",
      "Car Air Conditioning",
      "Windscreen Repair",
      "Car Detailing",
      "Vehicle Wrapping",
      "Car Audio Installation",
      "Car Security Systems",
      "Electric Vehicle Services",
      "Classic Car Restoration",
      "Motorcycle Repairs"
    ]
  },
  "Pet Services": {
    name: "Pet Services",
    subcategories: [
      "Dog Walking",
      "Pet Sitting",
      "Pet Grooming",
      "Veterinary Services",
      "Pet Training",
      "Cat Sitting",
      "Pet Boarding",
      "Pet Transportation",
      "Pet Food Delivery",
      "Aquarium Maintenance",
      "Horse Training",
      "Pet Photography",
      "Pet Behavior Consulting",
      "Pet Waste Removal",
      "Pet Supply Shop",
      "Pet Insurance",
      "Pet Adoption Services",
      "Pet Funeral Services",
      "Pet Microchipping",
      "Pet Dental Care"
    ]
  },
  "Business Services": {
    name: "Business Services",
    subcategories: [
      "Office Cleaning",
      "Commercial Property Maintenance",
      "Security Services",
      "Waste Management",
      "Commercial Removals",
      "Office Fit Out",
      "Commercial Pest Control",
      "Fire Safety Services",
      "Commercial Landscaping",
      "Commercial Cleaning",
      "Document Storage",
      "Document Shredding",
      "Courier Services",
      "Print Services",
      "Telecommunications",
      "Office Equipment",
      "Commercial Insurance",
      "Health & Safety Services",
      "Energy Management",
      "Facilities Management"
    ]
  },
  "Medical & Healthcare": {
    name: "Medical & Healthcare",
    icon: FaMedkit,
    description: "Professional medical and healthcare services for individuals and organizations",
    subcategories: [
      "Private Doctors",
      "Nurses",
      "Physiotherapists",
      "Dentists",
      "Optometrists",
      "Mental Health Services",
      "Occupational Therapy",
      "Speech Therapy",
      "Nutritionists",
      "Dietitians",
      "Chiropractors",
      "Osteopaths",
      "Podiatrists",
      "Home Healthcare",
      "Medical Equipment Supply",
      "Medical Transportation",
      "Laboratory Services",
      "X-Ray & Imaging",
      "Alternative Medicine",
      "Acupuncture",
      "Massage Therapy",
      "Rehabilitation Services",
      "Sports Medicine",
      "Pediatric Services",
      "Elder Care Services"
    ]
  },
  "Technology & Digital": {
    name: "Technology & Digital",
    icon: FaLaptop,
    description: "Comprehensive technology and digital services for modern business needs",
    subcategories: [
      "Web Development",
      "Mobile App Development",
      "Software Development",
      "Cloud Services",
      "IT Support",
      "Network Installation",
      "Cybersecurity",
      "Data Recovery",
      "Computer Repair",
      "Digital Marketing",
      "SEO Services",
      "Social Media Management",
      "Content Creation",
      "Email Marketing",
      "E-commerce Development",
      "UI/UX Design",
      "System Administration",
      "Database Management",
      "AI & Machine Learning",
      "Blockchain Development",
      "IoT Services",
      "Virtual Reality",
      "Augmented Reality",
      "Game Development",
      "Technical Support"
    ]
  },
  "Creative & Design": {
    name: "Creative & Design",
    icon: FaPalette,
    description: "Professional creative and design services for all mediums",
    subcategories: [
      "Graphic Design",
      "Logo Design",
      "Brand Identity Design",
      "Web Design",
      "Interior Design",
      "Product Design",
      "Fashion Design",
      "Illustration",
      "Animation",
      "3D Modeling",
      "Video Production",
      "Photography",
      "Art Direction",
      "Copywriting",
      "Content Creation",
      "Print Design",
      "Packaging Design",
      "Exhibition Design",
      "Motion Graphics",
      "Sound Design",
      "Set Design",
      "Architectural Visualization",
      "Character Design",
      "Typography",
      "Visual Effects"
    ]
  },
  "Food & Beverage": {
    name: "Food & Beverage",
    icon: FaUtensils,
    description: "Comprehensive food and beverage services for all occasions",
    subcategories: [
      "Catering Services",
      "Personal Chefs",
      "Bartenders",
      "Food Delivery",
      "Restaurant Consulting",
      "Menu Development",
      "Food Safety Training",
      "Wine Tasting",
      "Cooking Classes",
      "Food Photography",
      "Food Styling",
      "Meal Prep Services",
      "Food Truck Services",
      "Wedding Catering",
      "Corporate Catering",
      "Event Catering",
      "Dietary Specialist Cooking",
      "Cake Making",
      "Coffee Services",
      "Mobile Bar Services",
      "Food Tour Guides",
      "Restaurant Equipment Repair",
      "Commercial Kitchen Design",
      "Food Packaging",
      "Beverage Consulting"
    ]
  },
  "Sports & Recreation": {
    name: "Sports & Recreation",
    icon: FaDumbbell,
    description: "Professional sports and recreational services for all skill levels",
    subcategories: [
      "Personal Training",
      "Sports Coaching",
      "Fitness Classes",
      "Yoga Instruction",
      "Swimming Lessons",
      "Tennis Coaching",
      "Golf Lessons",
      "Dance Classes",
      "Martial Arts Training",
      "Team Sports Training",
      "Adventure Sports",
      "Rock Climbing",
      "Horse Riding",
      "Water Sports",
      "Skiing Lessons",
      "Fitness Equipment Repair",
      "Sports Facility Management",
      "Sports Photography",
      "Sports Massage",
      "Nutrition Coaching",
      "Sports Psychology",
      "Physical Therapy",
      "Sports Equipment Rental",
      "Referee Services",
      "Sports Event Planning"
    ]
  },
  "Travel & Tourism": {
    name: "Travel & Tourism",
    icon: FaPlane,
    description: "Professional travel and tourism services for leisure and business",
    subcategories: [
      "Travel Planning",
      "Tour Guides",
      "Travel Agents",
      "Vacation Rentals",
      "Adventure Tours",
      "Cultural Tours",
      "Business Travel",
      "Luxury Travel",
      "Group Tours",
      "Educational Tours",
      "Eco Tourism",
      "Safari Tours",
      "City Tours",
      "Food Tours",
      "Wine Tours",
      "Photography Tours",
      "Cruise Planning",
      "Airport Transfers",
      "Travel Insurance",
      "Visa Services",
      "Language Translation",
      "Tourist Information",
      "Accommodation Booking",
      "Transportation Services",
      "Travel Photography"
    ]
  },
  "Manufacturing & Industrial": {
    name: "Manufacturing & Industrial",
    icon: FaIndustry,
    description: "Comprehensive manufacturing and industrial services for businesses",
    subcategories: [
      "Custom Manufacturing",
      "Metal Fabrication",
      "Plastic Manufacturing",
      "Wood Manufacturing",
      "Textile Manufacturing",
      "Electronics Manufacturing",
      "Food Processing",
      "Chemical Processing",
      "Industrial Equipment",
      "Quality Control",
      "Process Automation",
      "Industrial Design",
      "Prototype Development",
      "CNC Machining",
      "3D Printing",
      "Welding Services",
      "Assembly Services",
      "Packaging Services",
      "Industrial Maintenance",
      "Equipment Repair",
      "Safety Compliance",
      "Environmental Compliance",
      "Supply Chain Management",
      "Inventory Management",
      "Logistics Services"
    ]
  },
  "Legal & Financial": {
    name: "Legal & Financial",
    icon: FaGavel,
    description: "Professional legal and financial services for individuals and businesses",
    subcategories: [
      "Corporate Law",
      "Criminal Law",
      "Family Law",
      "Employment Law",
      "Immigration Law",
      "Real Estate Law",
      "Tax Law",
      "Intellectual Property",
      "Financial Planning",
      "Investment Management",
      "Tax Preparation",
      "Bookkeeping",
      "Payroll Services",
      "Debt Collection",
      "Bankruptcy Services",
      "Estate Planning",
      "Will Writing",
      "Mediation Services",
      "Legal Document Review",
      "Contract Preparation",
      "Corporate Formation",
      "Mergers & Acquisitions",
      "Securities Law",
      "International Law",
      "Environmental Law"
    ]
  },
  "Agriculture & Farming": {
    name: "Agriculture & Farming",
    icon: FaLeaf,
    description: "Professional agricultural and farming services",
    subcategories: [
      "Crop Farming",
      "Livestock Management",
      "Organic Farming",
      "Hydroponics",
      "Aquaculture",
      "Farm Equipment",
      "Soil Testing",
      "Pest Management",
      "Irrigation Systems",
      "Farm Consulting",
      "Agricultural Research",
      "Greenhouse Management",
      "Harvest Services",
      "Animal Breeding",
      "Feed Supply",
      "Veterinary Services",
      "Farm Maintenance",
      "Agricultural Technology",
      "Sustainable Farming",
      "Farm Safety",
      "Land Management",
      "Forestry Services",
      "Wine Production",
      "Dairy Farming",
      "Poultry Farming"
    ]
  },
  "Real Estate & Property": {
    name: "Real Estate & Property",
    icon: FaBuilding,
    description: "Comprehensive real estate and property services",
    subcategories: [
      "Property Sales",
      "Property Rentals",
      "Property Management",
      "Commercial Real Estate",
      "Residential Real Estate",
      "Property Development",
      "Property Valuation",
      "Building Inspection",
      "Land Surveying",
      "Property Investment",
      "Mortgage Services",
      "Title Services",
      "Real Estate Law",
      "Property Insurance",
      "Property Maintenance",
      "Facilities Management",
      "Strata Management",
      "Property Marketing",
      "Auction Services",
      "Property Photography",
      "Virtual Tours",
      "Property Staging",
      "Lease Administration",
      "Tenant Screening",
      "Property Tax Assessment"
    ]
  },
  "Environmental Services": {
    name: "Environmental Services",
    icon: FaLeaf,
    description: "Professional environmental and sustainability services",
    subcategories: [
      "Environmental Consulting",
      "Waste Management",
      "Recycling Services",
      "Environmental Assessment",
      "Renewable Energy",
      "Energy Efficiency",
      "Water Treatment",
      "Air Quality Testing",
      "Soil Remediation",
      "Environmental Compliance",
      "Sustainability Consulting",
      "Green Building",
      "Carbon Footprint Analysis",
      "Environmental Impact Studies",
      "Habitat Restoration",
      "Wildlife Management",
      "Environmental Education",
      "Pollution Control",
      "Environmental Engineering",
      "Ecological Surveys",
      "Climate Change Consulting",
      "Environmental Law",
      "Waste Reduction",
      "Environmental Monitoring",
      "Sustainable Design"
    ]
  },
  "Security & Safety": {
    name: "Security & Safety",
    icon: FaShieldAlt,
    description: "Comprehensive security and safety services for businesses and individuals",
    subcategories: [
      "Security Guards",
      "CCTV Installation",
      "Access Control Systems",
      "Security Consulting",
      "Private Investigation",
      "Event Security",
      "Cyber Security",
      "Home Security",
      "Business Security",
      "Fire Safety",
      "Health & Safety",
      "Risk Assessment",
      "Security Training",
      "Emergency Response",
      "Security System Installation",
      "Mobile Patrols",
      "Asset Protection",
      "VIP Protection",
      "Security Auditing",
      "Surveillance Services",
      "Background Checks",
      "Security Equipment",
      "Crisis Management",
      "Safety Training",
      "Security Management"
    ]
  },
  "Media & Entertainment": {
    name: "Media & Entertainment",
    icon: FaVideo,
    description: "Professional media production and entertainment services",
    subcategories: [
      "Film Production",
      "Video Production",
      "Music Production",
      "Photography",
      "Audio Recording",
      "Live Streaming",
      "Event Broadcasting",
      "Voice Over Services",
      "Animation",
      "Post Production",
      "Sound Design",
      "Lighting Design",
      "Special Effects",
      "Media Consulting",
      "Talent Management",
      "Event Production",
      "Studio Rental",
      "Equipment Rental",
      "Content Creation",
      "Podcast Production",
      "Social Media Content",
      "Virtual Events",
      "Gaming Content",
      "Media Distribution",
      "Entertainment Booking"
    ]
  },
  "Retail & Shopping": {
    name: "Retail & Shopping",
    icon: FaShoppingBag,
    description: "Retail services and shopping assistance",
    subcategories: [
      "Personal Shopping",
      "Mystery Shopping",
      "Retail Consulting",
      "Visual Merchandising",
      "Store Design",
      "Inventory Management",
      "POS Systems",
      "E-commerce Services",
      "Retail Marketing",
      "Customer Service",
      "Store Management",
      "Product Sourcing",
      "Retail Training",
      "Market Research",
      "Brand Development",
      "Sales Strategy",
      "Retail Analytics",
      "Store Security",
      "Retail Technology",
      "Shopping Centers",
      "Pop-up Shops",
      "Retail Leasing",
      "Franchise Consulting",
      "Retail Automation",
      "Consumer Insights"
    ]
  },
  "Transportation & Logistics": {
    name: "Transportation & Logistics",
    icon: FaTruck,
    description: "Professional transportation and logistics services",
    subcategories: [
      "Freight Transport",
      "Courier Services",
      "Logistics Management",
      "Warehousing",
      "Supply Chain Management",
      "Fleet Management",
      "Moving Services",
      "Storage Solutions",
      "International Shipping",
      "Last Mile Delivery",
      "Cold Chain Logistics",
      "Customs Brokerage",
      "Transport Planning",
      "Inventory Management",
      "Distribution Services",
      "Route Optimization",
      "Packaging Services",
      "Transportation Security",
      "Vehicle Leasing",
      "Cargo Insurance",
      "Port Services",
      "Air Freight",
      "Rail Transport",
      "Maritime Services",
      "Express Delivery"
    ]
  },
  "Non-Profit & Community": {
    name: "Non-Profit & Community",
    icon: FaHandsHelping,
    description: "Community support and non-profit organization services",
    subcategories: [
      "Charity Organizations",
      "Community Development",
      "Social Services",
      "Youth Programs",
      "Senior Services",
      "Disability Services",
      "Mental Health Support",
      "Homeless Services",
      "Food Banks",
      "Volunteer Coordination",
      "Grant Writing",
      "Fundraising",
      "Advocacy Services",
      "Crisis Support",
      "Family Services",
      "Educational Programs",
      "Community Health",
      "Environmental Programs",
      "Arts & Culture Programs",
      "Sports Programs",
      "Refugee Services",
      "Veterans Services",
      "Animal Welfare",
      "Disaster Relief",
      "Community Events"
    ]
  },
  "Research & Development": {
    name: "Research & Development",
    icon: FaFlask,
    description: "Professional research and development services across industries",
    subcategories: [
      "Scientific Research",
      "Market Research",
      "Product Development",
      "Clinical Trials",
      "Technology Research",
      "Medical Research",
      "Agricultural Research",
      "Environmental Research",
      "Data Analysis",
      "Statistical Analysis",
      "Laboratory Services",
      "Research Consulting",
      "Prototype Development",
      "Innovation Consulting",
      "Patent Research",
      "Feasibility Studies",
      "User Research",
      "Behavioral Research",
      "Materials Testing",
      "Quality Assurance",
      "Research Documentation",
      "Research Equipment",
      "Research Software",
      "Field Research",
      "Academic Research"
    ]
  },
  "Education & Training (Extended)": {
    name: "Education & Training",
    icon: FaGraduationCap,
    description: "Comprehensive educational and training services for all ages and levels",
    subcategories: [
      "Academic Tutoring",
      "Professional Training",
      "Language Education",
      "Technical Training",
      "Vocational Training",
      "Online Education",
      "Special Education",
      "Adult Education",
      "Corporate Training",
      "Skills Development",
      "Test Preparation",
      "Music Education",
      "Art Education",
      "Sports Training",
      "Safety Training",
      "Computer Training",
      "Leadership Development",
      "Professional Certification",
      "Educational Consulting",
      "Curriculum Development",
      "Educational Technology",
      "Distance Learning",
      "Early Childhood Education",
      "Life Skills Training",
      "Career Counseling"
    ]
  },
  "Specialized Services": {
    name: "Specialized Services",
    icon: FaTools,
    description: "Unique and specialized professional services",
    subcategories: [
      "Antique Restoration",
      "Art Restoration",
      "Clock & Watch Repair",
      "Instrument Repair",
      "Jewelry Design",
      "Custom Metalwork",
      "Taxidermy",
      "Boat Repair",
      "Aircraft Maintenance",
      "Wine Consulting",
      "Personal Styling",
      "Color Consulting",
      "Genealogy Research",
      "Voice Acting",
      "Translation Services",
      "Interpretation Services",
      "Calligraphy",
      "Custom Framing",
      "Rare Book Dealing",
      "Memorabilia Authentication",
      "Personal Shopping",
      "Professional Organization",
      "Relocation Services",
      "Virtual Assistant",
      "Custom Publishing"
    ]
  }
};

export const getAllCategories = () => {
  return Object.keys(jobCategories);
};

export const getSubcategories = (category) => {
  return jobCategories[category]?.subcategories || [];
};