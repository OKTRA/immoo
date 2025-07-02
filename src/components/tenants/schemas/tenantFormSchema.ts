import { z } from "zod";

export const tenantFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères.",
  }),
  lastName: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  phone: z.string().min(8, {
    message: "Le numéro de téléphone doit contenir au moins 8 caractères.",
  }),
  profession: z.string().optional(),
  employmentStatus: z.string().optional(),
  photoUrl: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
  identityPhotos: z.array(z.string()).optional(),
  identityFiles: z.any().optional(),
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>;
