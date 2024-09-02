'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { AuthError } from '@supabase/supabase-js'


const supabase = createClient();

export async function login(formData: FormData) {

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}


// EMAIL SENDING 
export async function signInWithEmail(prevState: any, formData: FormData) { 
   
  const validateData = z.object({
      email: z.string()
      .max(60, 'Email must be between 10 and 60 characters')
      .min(10, 'Email must be between 10 and 60 characters')
      .email({ message: 'Email must be a valid email' })
      .refine((value) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value);
      }, { message: 'Email must be a valid email' })
     })

     const result = validateData.safeParse({
        email: formData.get('email')
     });

     if (!result.success) {
        return { 
          message: result.error.flatten().fieldErrors.email
        }
     }

    const { data, error } = await supabase.auth.signInWithOtp({
        email: result.data.email,
        options: {
            shouldCreateUser: false,    
        },
  
    })

    if(data.session) { 
       redirect('/todo');
    }
    if (error ) { 
       return {
        message: (error as AuthError).message,
       }
    }
    else {
      return {
        success: "Check your email for the login link"
       }
    }

}


export async function signInWithGithub() { 
  const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
          redirectTo: 'http://localhost:3000/auth/callback',
      }
   })


   if(data.url) { 
      redirect(data.url)
   }
   console.log(data);
   if (error) { 
     return {
       message: 'Something went wrong', error
     }
   }
}