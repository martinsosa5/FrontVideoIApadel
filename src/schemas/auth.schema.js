import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras"),
  
  lastName: z.string()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras"),

  dni: z.string().min(7, "Mínimo 7 números").max(9, "Máximo 9 números").regex(/^\d+$/, "Solo números"),
  email: z.string().email("Formato de correo inválido"),
  password: z.string()
    .min(8, "Mínimo 8 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^a-zA-Z0-9]/, "Debe contener al menos un carácter especial (ej: !@#$%)"),
  confirmPassword: z.string({ required_error: "Debes confirmar tu contraseña" }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string()
    .email({ message: "Correo inválido" })
    .max(80, { message: "El correo no puede tener más de 80 caracteres" }),
  password: z.string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .max(30, { message: "La contraseña no puede tener más de 30 caracteres" })
});

export const updateProfileSchema = z.object({
  firstName: z.string()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras"),
  
  lastName: z.string()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras"),
  
  phone: z.string()
    .regex(/^[0-9]*$/, "El teléfono solo puede contener números")
    .max(15, "Máximo 15 números")
    .optional()
    .or(z.literal("")),
  
  address: z.string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, "La contraseña actual es obligatoria"),
    
  newPassword: z.string()
    .min(8, "Mínimo 8 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^a-zA-Z0-9]/, "Debe contener al menos un carácter especial (ej: !@#$%)"),
    
  confirmNewPassword: z.string()
    .min(1, "Debes confirmar tu nueva contraseña")
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Las contraseñas nuevas no coinciden",
  path: ["confirmNewPassword"],
});

export const changeEmailSchema = z.object({
  newEmail: z.string()
    .min(1, "El nuevo correo es obligatorio")
    .email("Formato de correo inválido"),
    
  currentPassword: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(30, "La contraseña no puede tener más de 30 caracteres")
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email({ message: "Ingresar un correo electrónico válido" })
    .max(80, { message: "El correo no puede tener más de 80 caracteres" }),
});

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, { message: "Mínimo 8 caracteres" })
    .max(30, { message: "Máximo 30 caracteres" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/, {
      message: "Debe tener 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial"
    }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});