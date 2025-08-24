import { useRef, useState } from "react";
import { useInView, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Building2, 
  Briefcase, 
  Shield, 
  Users2, 
  FileText, 
  Calculator,
  Calendar,
  Smartphone,
  ArrowRight
} from "lucide-react";
import { Feature } from "@/assets/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BecomeAgencyForm from "@/components/auth/BecomeAgencyForm";
import { useTranslation } from "@/hooks/useTranslation";

export default function FeatureSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showAgencyDialog, setShowAgencyDialog] = useState(false);
  
  const features: Feature[] = [
    {
      title: t('features.propertyManagement'),
      description: t('features.propertyManagementDesc'),
      icon: "Building2"
    },
    {
      title: t('features.tenantManagement'),
      description: t('features.tenantManagementDesc'),
      icon: "Users2"
    },
    {
      title: t('features.paymentTracking'),
      description: t('features.paymentTrackingDesc'),
      icon: "Calculator"
    },
    {
      title: t('features.contractGeneration'),
      description: t('features.contractGenerationDesc'),
      icon: "FileText"
    },
    {
      title: t('features.analytics'),
      description: t('features.analyticsDesc'),
      icon: "BarChart3"
    },
    {
      title: t('features.leaseManagement'),
      description: t('features.leaseManagementDesc'),
      icon: "Calendar"
    },
    {
      title: t('features.agencyProfile'),
      description: t('features.agencyProfileDesc'),
      icon: "Briefcase"
    },
    {
      title: t('features.searchFilters'),
      description: t('features.searchFiltersDesc'),
      icon: "Shield"
    },
    {
      title: t('features.responsiveInterface'),
      description: t('features.responsiveInterfaceDesc'),
      icon: "Smartphone"
    }
  ];

  const featureRef = useRef(null);
  const isFeatureInView = useInView(featureRef, { once: true, amount: 0.2 });

  // Map icon string to icon component
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Building2: <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />,
      Users2: <Users2 className="h-4 w-4 sm:h-5 sm:w-5" />,
      Briefcase: <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />,
      BarChart3: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />,
      FileText: <FileText className="h-4 w-4 sm:h-5 sm:w-5" />,
      Shield: <Shield className="h-4 w-4 sm:h-5 sm:w-5" />,
      Calculator: <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />,
      Calendar: <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />,
      Smartphone: <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
    };
    
    return iconMap[iconName] || null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gray-50" id="features">

      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header Section - Mobile Optimized */}
        <motion.div 
          ref={featureRef}
          className="max-w-3xl mx-auto text-center mb-6 sm:mb-8 lg:mb-10"
          initial="hidden"
          animate={isFeatureInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.h2 variants={itemVariants} className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-3 sm:mb-4 text-gray-900 tracking-tight">
            {t('features.sectionTitle')}
          </motion.h2>
          
          <motion.p variants={itemVariants} className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed px-2">
            {t('features.sectionSubtitle')}
          </motion.p>
          
        </motion.div>

        {/* Features Grid - Mobile Optimized */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5"
          initial="hidden"
          animate={isFeatureInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group bg-white rounded-lg p-3 sm:p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 text-center"
            >
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:scale-105 transition-all duration-300">
                  {getIconComponent(feature.icon)}
                </div>
              </div>
              <h3 className="text-xs sm:text-sm lg:text-base font-semibold mb-1 sm:mb-2 text-gray-900 leading-tight">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 hidden sm:block">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section - Mobile Optimized */}
        <motion.div 
          className="text-center mt-6 sm:mt-8 lg:mt-10 px-2"
          initial="hidden"
          animate={isFeatureInView ? "visible" : "hidden"}
          variants={itemVariants}
        >
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
            {t('features.ctaTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 max-w-sm mx-auto leading-relaxed">
            {t('features.ctaSubtitle')}
          </p>
          <Button 
            onClick={() => setShowAgencyDialog(true)}
            className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {t('features.ctaButton')}
            <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Dialog pour créer une agence */}
      <Dialog open={showAgencyDialog} onOpenChange={setShowAgencyDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-900">
              {t('features.dialogTitle')}
            </DialogTitle>
          </DialogHeader>
          <BecomeAgencyForm 
            onSuccess={() => {
              setShowAgencyDialog(false);
              // Optionnel: rediriger vers le dashboard de l'agence
              // navigate('/agencies');
            }}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
