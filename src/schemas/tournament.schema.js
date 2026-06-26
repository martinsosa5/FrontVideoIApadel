// src/schemas/tournament.schema.js
import { z } from "zod";

export const createTournamentSchema = z.object({
  name: z.string().min(3, "El nombre del torneo debe tener al menos 3 caracteres"),
  club: z.string().min(2, "El nombre de la sede es obligatorio"),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  endDate: z.string().min(1, "La fecha de fin es obligatoria"),
  status: z.string().optional(),
  
  // Imagen principal y vista pública
  posterImage: z.string().optional(),
  showInHome: z.boolean().optional(),

  // 🔥 NUEVOS CAMPOS OPCIONALES PARA "MÁS INFO"
  description: z.string().optional(),
  prizes: z.string().optional(),
  modality: z.string().optional(),
  price: z.coerce.number().optional(), // Convierte el texto del FormData a Número
  flyerImage: z.string().optional(),
  
  contacts: z.array(
    z.object({
      name: z.string().optional(),
      phone: z.string().optional()
    })
  ).optional(),

  categories: z.array(
    z.object({
      name: z.string().min(1, "Requerido"),
      gender: z.enum(["Masculino", "Femenino", "Mixto"])
    })
  ).min(1, "Debe seleccionar al menos una categoría para el torneo")
});

export const updateTournamentSchema = z.object({
  name: z.string().optional(),
  club: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  
  posterImage: z.string().optional(),
  showInHome: z.boolean().optional(),
  isEnrollmentUpdate: z.boolean().optional(),
  
  // 🔥 NUEVOS CAMPOS OPCIONALES EN EDICIÓN
  description: z.string().optional(),
  prizes: z.string().optional(),
  modality: z.string().optional(),
  price: z.coerce.number().optional(),
  flyerImage: z.string().optional(),
  
  contacts: z.array(
    z.object({
      name: z.string().optional(),
      phone: z.string().optional()
    })
  ).optional(),

  categories: z.array(z.any()).optional() 
});