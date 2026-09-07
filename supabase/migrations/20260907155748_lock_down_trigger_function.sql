-- De trigger draait als de database zelf. Niemand hoeft hem via de API aan te roepen.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
