// src/schemas/player.schema.js
import { z } from "zod";

export const createPlayerSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  dni: z.string().min(7, "DNI muy corto").max(10, "DNI muy largo"),
  birthDate: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  phone: z.string().min(6, "Teléfono muy corto").optional().or(z.literal("")),
  category: z.string().min(1, "La categoría es obligatoria"),
  position: z.enum(['Drive', 'Revés', 'Ambos']).optional().default('Ambos'),
  gender: z.enum(['Masculino', 'Femenino'], { required_error: "El género es obligatorio" }),
  // Agregamos la foto para que Zod la deje pasar sin quejarse
  profileImage: z.string().optional().or(z.literal("")),
});