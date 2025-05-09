const FinalizarVenda = () => {
    const handleFinalizarVenda = (event) => {
        event.preventDefault();
        if (confirm('Tem certeza que deseja finalizar esta venda? Esta ação atualizará o estoque e não poderá ser desfeita.')) {
            document.getElementById('finalizar-form').submit();
        }
    };
    React.useEffect(() => {
        const form = document.getElementById('finalizar-form');
        if (form) {
            form.addEventListener('submit', handleFinalizarVenda);
            return () => {
                form.removeEventListener('submit', handleFinalizarVenda);
            };
        }
    }, []);
    return null;
};

document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    ReactDOM.render(React.createElement(FinalizarVenda), container);
});