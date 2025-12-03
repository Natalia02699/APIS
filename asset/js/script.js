const btnBuscar = document.getElementById("btnBuscar");
const resultado = document.getElementById("resultado");
const error = document.getElementById("error");
let chart; // guardará el gráfico

btnBuscar.addEventListener("click", () => {
    convertirMoneda();
});

// FUNCIÓN PRINCIPAL
async function convertirMoneda() {
    const monto = Number(document.getElementById("monto").value);
    const moneda = document.getElementById("moneda").value;

    resultado.textContent = "";
    error.textContent = "";

    if (!monto || monto <= 0) {
        error.textContent = "Ingresa un monto válido.";
        return;
    }
    if (!moneda) {
        error.textContent = "Selecciona una moneda.";
        return;
    }

    try {
        // 1. FETCH A LA API
        const res = await fetch("https://mindicador.cl/api");
        if (!res.ok) throw new Error("Problema al obtener datos de la API");

        const data = await res.json();

        // 2. OBTENER VALOR ACTUAL DE LA MONEDA
        const valor = data[moneda].valor;

        // 3. CALCULAR CONVERSIÓN
        const conversion = (monto / valor).toFixed(2);

        resultado.textContent = `Resultado: ${conversion} ${moneda}`;

        // 4. OBTENER HISTORICO DE 10 DÍAS
        const resHist = await fetch(`https://mindicador.cl/api/${moneda}`);
        if (!resHist.ok) throw new Error("Error al obtener historial");

        const dataHist = await resHist.json();

        const ultimos10 = dataHist.serie.slice(0, 10).reverse();

        const labels = ultimos10.map(d => new Date(d.fecha).toLocaleDateString());
        const valores = ultimos10.map(d => d.valor);

        // 5. GRAFICAR
        renderGrafico(labels, valores);

    } catch (e) {
        error.textContent = "Error: " + e.message;
    }
}

// FUNCIÓN PARA RENDERIZAR GRAFICO
function renderGrafico(labels, valores) {
    const ctx = document.getElementById("grafico");

    // Eliminar gráfico anterior si existe
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Historial últimos 10 días",
                data: valores
            }]
        }
    });
}
