import * as z from "zod"

// We export functions to allow injecting translations
export const createLoginSchema = (t: (key: string) => string) => z.object({
  email: z.string().email({
    message: t('validation.email_invalid') || "Email inválido",
  }),
  password: z.string().min(1, {
    message: t('validation.password_required') || "La contraseña es requerida",
  }),
})

export const createRegisterSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, {
    message: t('validation.name_min') || "El nombre debe tener al menos 2 caracteres",
  }),
  email: z.string().email({
    message: t('validation.email_invalid') || "Email inválido",
  }),
  password: z.string().min(6, {
    message: t('validation.password_min') || "La contraseña debe tener al menos 6 caracteres",
  }),
})

// Types remain the same, but we need to infer from the return type of the function or just define them manually to avoid circular complexity.
// Actually, z.infer works on the schema instance.
// Let's define base schemas just for type inference or use a helper type.
const baseLoginSchema = z.object({ email: z.string(), password: z.string() })
const baseRegisterSchema = z.object({ name: z.string(), email: z.string(), password: z.string() })

export type LoginValues = z.infer<typeof baseLoginSchema>
export type RegisterValues = z.infer<typeof baseRegisterSchema>
