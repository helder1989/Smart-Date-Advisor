export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateLoginForm(email: string, password: string): string | null {
  if (!email.trim()) return 'Por favor, insira seu e-mail';
  if (!validateEmail(email)) return 'E-mail inválido';
  if (!password.trim()) return 'Por favor, insira sua senha';
  if (password.length < 4) return 'Senha deve ter pelo menos 4 caracteres';
  return null;
}
