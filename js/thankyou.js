document.addEventListener('DOMContentLoaded', () => {
  // Executa somente se estiver na página de obrigado
  if (!window.location.pathname.includes('obrigado.html')) return;

  const formData = sessionStorage.getItem('contactFormData');

  if (formData) {
    try {
      const { name } = JSON.parse(formData);

      // Alvo seguro: título da página de obrigado
      const heading = document.getElementById('thankYouTitle');
      if (heading && name) {
        heading.textContent = `Obrigado, ${name}!`;
      }
    } catch (error) {
      console.error('Erro ao interpretar os dados do formulário:', error);
    }

    // Remove os dados mesmo se der erro para evitar interferência em outras páginas
    sessionStorage.removeItem('contactFormData');
  }
});
