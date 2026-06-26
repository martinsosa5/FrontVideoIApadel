import { z } from "zod";

export const createStaffSchema = z.object({
  firstName: z.string()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras"),
  
  lastName: z.string()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras"),

  dni: z.string()
    .min(7, "Mínimo 7 números")
    .max(9, "Máximo 9 números")
    .regex(/^\d+$/, "Solo números"),
    
  email: z.string()
    .email("Formato de correo inválido"),
    
  phone: z.string()
    .regex(/^[0-9]*$/, "El teléfono solo puede contener números")
    .max(15, "Máximo 15 números")
    .optional()
    .or(z.literal("")),
  
  address: z.string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),

  role: z.enum(['ADMIN', 'STAFF'], {
    required_error: "El rol es obligatorio",
    invalid_type_error: "Rol no válido"
  }),
  
  confirmarReactivacion: z.boolean().optional()
});