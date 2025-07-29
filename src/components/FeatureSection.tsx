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
      Building2: <Building2 className="h-full w-full" />,
      Users2: <Users2 className="h-full w-full" />,
      Briefcase: <Briefcase className="h-full w-full" />,
      BarChart3: <BarChart3 className="h-full w-full" />,
      FileText: <FileText className="h-full w-full" />,
      Shield: <Shield className="h-full w-full" />,
      Calculator: <Calculator className="h-full w-full" />,
      Calendar: <Calendar className="h-full w-full" />,
      Smartphone: <Smartphone className="h-full w-full" />
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
    <section className="py-16 sm:py-20 md:py-24 bg-white" id="features">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          ref={featureRef}
          className="max-w-4xl mx-auto text-center mb-16"
          initial="hidden"
          animate={isFeatureInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-light mb-6 text-gray-900 tracking-tight">
            {t('features.sectionTitle')}
          </motion.h2>
          
          <motion.p variants={itemVariants} className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('features.sectionSubtitle')}
          </motion.p>
          
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate={isFeatureInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-700 group-hover:bg-gray-100 transition-colors duration-200">
                {getIconComponent(feature.icon)}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center mt-16"
          initial="hidden"
          animate={isFeatureInView ? "visible" : "hidden"}
          variants={itemVariants}
        >
          <h3 className="text-2xl font-semibold mb-4 text-gray-900">
            {t('features.ctaTitle')}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {t('features.ctaSubtitle')}
          </p>
          <Button 
            onClick={() => setShowAgencyDialog(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center"
          >
            {t('features.ctaButton')}
            <ArrowRight className="ml-2 h-4 w-4" />
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
