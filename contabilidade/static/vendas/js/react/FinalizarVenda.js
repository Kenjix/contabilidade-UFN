// Componente React para finalizar venda
const FinalizarVenda = () => {
    // Função para lidar com a finalização da venda
    const handleFinalizarVenda = (event) => {
        event.preventDefault();
        
        // Mostrar confirmação antes de enviar o formulário
        if (confirm('Tem certeza que deseja finalizar esta venda? Esta ação atualizará o estoque e não poderá ser desfeita.')) {
            document.getElementById('finalizar-form').submit();
        }
    };

    // Encontrar o formulário de finalização se existir
    React.useEffect(() => {
        const form = document.getElementById('finalizar-form');
        if (form) {
            // Adicionar o evento de submissão
            form.addEventListener('submit', handleFinalizarVenda);
            
            // Limpar o evento quando o componente for desmontado
            return () => {
                form.removeEventListener('submit', handleFinalizarVenda);
            };
        }
    }, []);

    // Este componente não renderiza nada visível, apenas adiciona funcionalidade
    return null;
};

// Renderizar o componente quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    ReactDOM.render(React.createElement(FinalizarVenda), container);
});