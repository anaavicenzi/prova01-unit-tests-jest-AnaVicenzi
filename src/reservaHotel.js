const STATUS_VALIDOS = ["pendente", "confirmada", "cancelada", "finalizada"];

class ReservaHotel {
  constructor() {
    this.quartos = [];
    this.hospedes = [];
    this.reservas = [];
    this.proximaReservaId = 1;
  }

  cadastrarQuarto(quarto) {
    if (!quarto || !quarto.numero || !quarto.tipo) return false;
    if (this.buscarQuartoPorNumero(quarto.numero)) return false;

    this.quartos.push({
      numero: quarto.numero,
      tipo: quarto.tipo,
      capacidade: quarto.capacidade || 2,
      valorDiaria: quarto.valorDiaria || 0,
      disponivel: true,
    });

    return true;
  }

  buscarQuartoPorNumero(numero) {
    return (
      this.quartos.find((quartoAtual) => quartoAtual.numero === numero) ||
      null
    );
  }

  buscarQuartosPorTipo(tipo) {
    return this.quartos.filter((quartoAtual) => quartoAtual.tipo === tipo);
  }

  listarQuartosDisponiveis() {
    return this.quartos.filter((quartoAtual) => quartoAtual.disponivel);
  }

  quartoEstaDisponivel(numero) {
    const quarto = this.buscarQuartoPorNumero(numero);
    return !!quarto && quarto.disponivel;
  }

  cadastrarHospede(hospede) {
    if (!hospede || !hospede.id || !hospede.nome) return false;
    if (this.buscarHospedePorId(hospede.id)) return false;

    this.hospedes.push({
      id: hospede.id,
      nome: hospede.nome,
      documento: hospede.documento || null,
    });

    return true;
  }

  buscarHospedePorId(id) {
    return (
      this.hospedes.find((hospedeAtual) => hospedeAtual.id === id) || null
    );
  }

  calcularNumeroDeDiarias(dataEntrada, dataSaida) {
    const inicio = new Date(dataEntrada);
    const fim = new Date(dataSaida);
    const diferencaEmMilissegundos = fim - inicio;

    if (diferencaEmMilissegundos <= 0) return 0;

    return Math.ceil(diferencaEmMilissegundos / (1000 * 60 * 60 * 24));
  }

  calcularValorTotal(numeroQuarto, dataEntrada, dataSaida) {
    const quarto = this.buscarQuartoPorNumero(numeroQuarto);
    if (!quarto) return 0;

    const diarias = this.calcularNumeroDeDiarias(dataEntrada, dataSaida);
    return diarias * quarto.valorDiaria;
  }

  criarReserva(dados) {
    if (!dados || !dados.hospedeId || !dados.numeroQuarto) return false;

    const hospede = this.buscarHospedePorId(dados.hospedeId);
    const quarto = this.buscarQuartoPorNumero(dados.numeroQuarto);

    if (!hospede || !quarto) return false;
    if (!quarto.disponivel) return false;

    const diarias = this.calcularNumeroDeDiarias(
      dados.dataEntrada,
      dados.dataSaida
    );
    if (diarias <= 0) return false;

    this.reservas.push({
      id: this.proximaReservaId,
      hospedeId: dados.hospedeId,
      numeroQuarto: dados.numeroQuarto,
      dataEntrada: dados.dataEntrada,
      dataSaida: dados.dataSaida,
      diarias,
      valorTotal: diarias * quarto.valorDiaria,
      status: "pendente",
    });

    quarto.disponivel = false;
    this.proximaReservaId += 1;

    return true;
  }

  buscarReservaPorId(id) {
    return (
      this.reservas.find((reservaAtual) => reservaAtual.id === id) || null
    );
  }

  listarReservasDoHospede(hospedeId) {
    return this.reservas.filter(
      (reservaAtual) => reservaAtual.hospedeId === hospedeId
    );
  }

  confirmarReserva(id) {
    const reserva = this.buscarReservaPorId(id);
    if (!reserva) return false;
    if (reserva.status !== "pendente") return false;

    reserva.status = "confirmada";
    return true;
  }

  cancelarReserva(id) {
    const reserva = this.buscarReservaPorId(id);
    if (!reserva) return false;
    if (reserva.status === "cancelada" || reserva.status === "finalizada") {
      return false;
    }

    reserva.status = "cancelada";
    const quarto = this.buscarQuartoPorNumero(reserva.numeroQuarto);
    if (quarto) quarto.disponivel = true;

    return true;
  }

  finalizarReserva(id) {
    const reserva = this.buscarReservaPorId(id);
    if (!reserva) return false;
    if (reserva.status !== "confirmada") return false;

    reserva.status = "finalizada";
    const quarto = this.buscarQuartoPorNumero(reserva.numeroQuarto);
    if (quarto) quarto.disponivel = true;

    return true;
  }

  aplicarDescontoNaReserva(id, percentual) {
    if (percentual <= 0 || percentual > 100) return false;

    const reserva = this.buscarReservaPorId(id);
    if (!reserva) return false;

    reserva.valorTotal =
      reserva.valorTotal - (reserva.valorTotal * percentual) / 100;
    return true;
  }

  listarReservasPorStatus(status) {
    if (!STATUS_VALIDOS.includes(status)) return [];

    return this.reservas.filter((reservaAtual) => reservaAtual.status === status);
  }

  calcularFaturamentoTotal() {
    return this.reservas
      .filter((reservaAtual) => reservaAtual.status !== "cancelada")
      .reduce((total, reservaAtual) => total + reservaAtual.valorTotal, 0);
  }

  calcularTaxaDeOcupacao() {
    if (this.quartos.length === 0) return 0;

    const ocupados = this.quartos.filter(
      (quartoAtual) => !quartoAtual.disponivel
    ).length;

    return Math.round((ocupados / this.quartos.length) * 100);
  }

  gerarRelatorio() {
    return {
      totalQuartos: this.quartos.length,
      quartosDisponiveis: this.listarQuartosDisponiveis().length,
      totalReservas: this.reservas.length,
      faturamentoTotal: this.calcularFaturamentoTotal(),
      taxaDeOcupacao: this.calcularTaxaDeOcupacao(),
    };
  }
}

module.exports = ReservaHotel;