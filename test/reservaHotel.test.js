const ReservaHotel = require("../src/reservaHotel");

const criarQuartoBase = (sobrescritas = {}) => ({
  numero: 101,
  tipo: "standard",
  capacidade: 2,
  valorDiaria: 200,
  ...sobrescritas,
});

const criarHospedeBase = (sobrescritas = {}) => ({
  id: 1,
  nome: "Ana",
  documento: "12345",
  ...sobrescritas,
});

const criarHotelComReservaPendente = () => {
  const hotel = new ReservaHotel();
  hotel.cadastrarQuarto(criarQuartoBase());
  hotel.cadastrarHospede(criarHospedeBase());
  hotel.criarReserva({
    hospedeId: 1,
    numeroQuarto: 101,
    dataEntrada: "2026-09-01",
    dataSaida: "2026-09-04",
  });

  return hotel;
};

describe("reserva de hotel", () => {
  test("deve cadastrar quarto valido e rejeitar dados invalidos ou duplicados", () => {
    // Arrange
    const hotel = new ReservaHotel();

    // Act
    const semDados = hotel.cadastrarQuarto(null);
    const semNumero = hotel.cadastrarQuarto({ tipo: "standard" });
    const cadastradoComSucesso = hotel.cadastrarQuarto(criarQuartoBase());
    const duplicado = hotel.cadastrarQuarto(criarQuartoBase());

    // Assert
    expect(semDados).toBe(false);
    expect(semNumero).toBe(false);
    expect(cadastradoComSucesso).toBe(true);
    expect(duplicado).toBe(false);
  });

  test("deve aplicar valores padrao quando quarto nao informa capacidade ou valorDiaria", () => {
    // Arrange
    const hotel = new ReservaHotel();

    // Act
    hotel.cadastrarQuarto({ numero: 202, tipo: "luxo" });
    const quarto = hotel.buscarQuartoPorNumero(202);

    // Assert
    expect(quarto).toEqual({
      numero: 202,
      tipo: "luxo",
      capacidade: 2,
      valorDiaria: 0,
      disponivel: true,
    });
  });

  test("deve buscar quarto por numero retornando quarto ou null", () => {
    // Arrange
    const hotel = new ReservaHotel();
    hotel.cadastrarQuarto(criarQuartoBase());

    // Act
    const encontrado = hotel.buscarQuartoPorNumero(101);
    const naoEncontrado = hotel.buscarQuartoPorNumero(999);

    // Assert
    expect(encontrado.tipo).toBe("standard");
    expect(naoEncontrado).toBeNull();
  });

  test("deve buscar quartos por tipo", () => {
    // Arrange
    const hotel = new ReservaHotel();
    hotel.cadastrarQuarto(criarQuartoBase({ numero: 101, tipo: "standard" }));
    hotel.cadastrarQuarto(criarQuartoBase({ numero: 102, tipo: "luxo" }));

    // Act
    const standards = hotel.buscarQuartosPorTipo("standard");
    const inexistente = hotel.buscarQuartosPorTipo("presidencial");

    // Assert
    expect(standards).toHaveLength(1);
    expect(standards[0].numero).toBe(101);
    expect(inexistente).toHaveLength(0);
  });

  test("deve listar somente quartos disponiveis", () => {
    // Arrange
    const hotel = new ReservaHotel();
    hotel.cadastrarQuarto(criarQuartoBase({ numero: 101 }));
    hotel.cadastrarQuarto(criarQuartoBase({ numero: 102 }));
    hotel.cadastrarHospede(criarHospedeBase());
    hotel.criarReserva({
      hospedeId: 1,
      numeroQuarto: 101,
      dataEntrada: "2026-09-01",
      dataSaida: "2026-09-03",
    });

    // Act
    const disponiveis = hotel.listarQuartosDisponiveis();

    // Assert
    expect(disponiveis).toHaveLength(1);
    expect(disponiveis[0].numero).toBe(102);
  });

  test("deve informar se um quarto esta disponivel", () => {
    // Arrange
    const hotel = criarHotelComReservaPendente();

    // Act
    const ocupado = hotel.quartoEstaDisponivel(101);
    const inexistente = hotel.quartoEstaDisponivel(999);

    // Assert
    expect(ocupado).toBe(false);
    expect(inexistente).toBe(false);
  });

  test("deve cadastrar hospede valido e rejeitar dados invalidos ou duplicados", () => {
    // Arrange
    const hotel = new ReservaHotel();

    // Act
    const semDados = hotel.cadastrarHospede(null);
    const semNome = hotel.cadastrarHospede({ id: 1 });
    const cadastradoComSucesso = hotel.cadastrarHospede(criarHospedeBase());
    const duplicado = hotel.cadastrarHospede(criarHospedeBase());

    // Assert
    expect(semDados).toBe(false);
    expect(semNome).toBe(false);
    expect(cadastradoComSucesso).toBe(true);
    expect(duplicado).toBe(false);
  });

  test("deve buscar hospede por id retornando hospede ou null", () => {
    // Arrange
    const hotel = new ReservaHotel();
    hotel.cadastrarHospede(criarHospedeBase());

    // Act
    const encontrado = hotel.buscarHospedePorId(1);
    const naoEncontrado = hotel.buscarHospedePorId(999);

    // Assert
    expect(encontrado.nome).toBe("Ana");
    expect(naoEncontrado).toBeNull();
  });

  test("deve calcular numero de diarias corretamente e retornar zero para datas invalidas", () => {
    // Arrange
    const hotel = new ReservaHotel();

    // Act
    const tresDiarias = hotel.calcularNumeroDeDiarias("2026-09-01", "2026-09-04");
    const dataSaidaAntesDaEntrada = hotel.calcularNumeroDeDiarias(
      "2026-09-10",
      "2026-09-05"
    );
    const mesmaData = hotel.calcularNumeroDeDiarias("2026-09-01", "2026-09-01");

    // Assert
    expect(tresDiarias).toBe(3);
    expect(dataSaidaAntesDaEntrada).toBe(0);
    expect(mesmaData).toBe(0);
  });

  test("deve calcular valor total da estadia e retornar zero para quarto inexistente", () => {
    // Arrange
    const hotel = new ReservaHotel();
    hotel.cadastrarQuarto(criarQuartoBase({ valorDiaria: 150 }));

    // Act
    const valorValido = hotel.calcularValorTotal(101, "2026-09-01", "2026-09-04");
    const quartoInexistente = hotel.calcularValorTotal(
      999,
      "2026-09-01",
      "2026-09-04"
    );

    // Assert
    expect(valorValido).toBe(450);
    expect(quartoInexistente).toBe(0);
  });

  test("deve criar reserva valida e rejeitar dados incompletos", () => {
    // Arrange
    const hotel = new ReservaHotel();
    hotel.cadastrarQuarto(criarQuartoBase());
    hotel.cadastrarHospede(criarHospedeBase());

    // Act
    const semDados = hotel.criarReserva(null);
    const semHospedeId = hotel.criarReserva({ numeroQuarto: 101 });
    const reservaValida = hotel.criarReserva({
      hospedeId: 1,
      numeroQuarto: 101,
      dataEntrada: "2026-09-01",
      dataSaida: "2026-09-04",
    });

    // Assert
    expect(semDados).toBe(false);
    expect(semHospedeId).toBe(false);
    expect(reservaValida).toBe(true);
    expect(hotel.buscarQuartoPorNumero(101).disponivel).toBe(false);
  });

  test("deve rejeitar reserva com hospede ou quarto inexistente", () => {
    // Arrange
    const hotel = new ReservaHotel();
    hotel.cadastrarQuarto(criarQuartoBase());
    hotel.cadastrarHospede(criarHospedeBase());

    // Act
    const hospedeInexistente = hotel.criarReserva({
      hospedeId: 999,
      numeroQuarto: 101,
      dataEntrada: "2026-09-01",
      dataSaida: "2026-09-04",
    });
    const quartoInexistente = hotel.criarReserva({
      hospedeId: 1,
      numeroQuarto: 999,
      dataEntrada: "2026-09-01",
      dataSaida: "2026-09-04",
    });

    // Assert
    expect(hospedeInexistente).toBe(false);
    expect(quartoInexistente).toBe(false);
  });

  test("deve rejeitar reserva quando quarto ja esta ocupado ou datas sao invalidas", () => {
    // Arrange
    const hotel = criarHotelComReservaPendente();
    hotel.cadastrarHospede(criarHospedeBase({ id: 2, nome: "Bruno" }));

    // Act
    const quartoOcupado = hotel.criarReserva({
      hospedeId: 2,
      numeroQuarto: 101,
      dataEntrada: "2026-10-01",
      dataSaida: "2026-10-05",
    });

    hotel.cadastrarQuarto(criarQuartoBase({ numero: 202 }));
    const datasInvalidas = hotel.criarReserva({
      hospedeId: 2,
      numeroQuarto: 202,
      dataEntrada: "2026-10-05",
      dataSaida: "2026-10-01",
    });

    // Assert
    expect(quartoOcupado).toBe(false);
    expect(datasInvalidas).toBe(false);
  });

  test("deve buscar reserva por id retornando reserva ou null", () => {
    // Arrange
    const hotel = criarHotelComReservaPendente();

    // Act
    const encontrada = hotel.buscarReservaPorId(1);
    const naoEncontrada = hotel.buscarReservaPorId(999);

    // Assert
    expect(encontrada.numeroQuarto).toBe(101);
    expect(naoEncontrada).toBeNull();
  });

  test("deve listar reservas de um hospede especifico", () => {
    // Arrange
    const hotel = criarHotelComReservaPendente();
    hotel.cadastrarQuarto(criarQuartoBase({ numero: 202 }));
    hotel.cadastrarHospede(criarHospedeBase({ id: 2, nome: "Bruno" }));
    hotel.criarReserva({
      hospedeId: 2,
      numeroQuarto: 202,
      dataEntrada: "2026-09-01",
      dataSaida: "2026-09-02",
    });

    // Act
    const reservasDoHospede1 = hotel.listarReservasDoHospede(1);
    const reservasDoHospede2 = hotel.listarReservasDoHospede(2);

    // Assert
    expect(reservasDoHospede1).toHaveLength(1);
    expect(reservasDoHospede2).toHaveLength(1);
    expect(reservasDoHospede1[0].numeroQuarto).toBe(101);
  });

  test("deve confirmar reserva pendente e rejeitar reserva inexistente ou ja confirmada", () => {
    // Arrange
    const hotel = criarHotelComReservaPendente();

    // Act
    const confirmadaComSucesso = hotel.confirmarReserva(1);
    const jaConfirmada = hotel.confirmarReserva(1);
    const inexistente = hotel.confirmarReserva(999);

    // Assert
    expect(confirmadaComSucesso).toBe(true);
    expect(jaConfirmada).toBe(false);
    expect(inexistente).toBe(false);
    expect(hotel.buscarReservaPorId(1).status).toBe("confirmada");
  });

  test("deve cancelar reserva e liberar o quarto, rejeitando reserva inexistente ou ja finalizada", () => {
    // Arrange
    const hotel = criarHotelComReservaPendente();

    // Act
    const inexistente = hotel.cancelarReserva(999);
    const canceladaComSucesso = hotel.cancelarReserva(1);
    const jaCancelada = hotel.cancelarReserva(1);

    // Assert
    expect(inexistente).toBe(false);
    expect(canceladaComSucesso).toBe(true);
    expect(jaCancelada).toBe(false);
    expect(hotel.buscarReservaPorId(1).status).toBe("cancelada");
    expect(hotel.buscarQuartoPorNumero(101).disponivel).toBe(true);
  });

  test("deve finalizar reserva confirmada e rejeitar reserva pendente ou inexistente", () => {
    // Arrange
    const hotel = criarHotelComReservaPendente();

    // Act
    const semConfirmar = hotel.finalizarReserva(1);
    hotel.confirmarReserva(1);
    const finalizadaComSucesso = hotel.finalizarReserva(1);
    const inexistente = hotel.finalizarReserva(999);

    // Assert
    expect(semConfirmar).toBe(false);
    expect(finalizadaComSucesso).toBe(true);
    expect(inexistente).toBe(false);
    expect(hotel.buscarReservaPorId(1).status).toBe("finalizada");
    expect(hotel.buscarQuartoPorNumero(101).disponivel).toBe(true);
  });

  test("deve aplicar desconto valido na reserva e rejeitar percentuais fora do intervalo", () => {
    // Arrange
    const hotel = criarHotelComReservaPendente();

    // Act
    const percentualZero = hotel.aplicarDescontoNaReserva(1, 0);
    const percentualAcimaDoLimite = hotel.aplicarDescontoNaReserva(1, 101);
    const reservaInexistente = hotel.aplicarDescontoNaReserva(999, 10);
    const descontoValido = hotel.aplicarDescontoNaReserva(1, 10);

    // Assert
    expect(percentualZero).toBe(false);
    expect(percentualAcimaDoLimite).toBe(false);
    expect(reservaInexistente).toBe(false);
    expect(descontoValido).toBe(true);
    expect(hotel.buscarReservaPorId(1).valorTotal).toBe(540);
  });

  test("deve listar reservas por status valido e retornar vazio para status invalido", () => {
    // Arrange
    const hotel = criarHotelComReservaPendente();

    // Act
    const pendentes = hotel.listarReservasPorStatus("pendente");
    const statusInvalido = hotel.listarReservasPorStatus("em_analise");

    // Assert
    expect(pendentes).toHaveLength(1);
    expect(statusInvalido).toEqual([]);
  });

  test("deve calcular faturamento total ignorando reservas canceladas", () => {
    // Arrange
    const hotel = criarHotelComReservaPendente();
    hotel.cadastrarQuarto(criarQuartoBase({ numero: 202, valorDiaria: 100 }));
    hotel.cadastrarHospede(criarHospedeBase({ id: 2, nome: "Bruno" }));
    hotel.criarReserva({
      hospedeId: 2,
      numeroQuarto: 202,
      dataEntrada: "2026-09-01",
      dataSaida: "2026-09-02",
    });
    hotel.cancelarReserva(2);

    // Act
    const faturamento = hotel.calcularFaturamentoTotal();

    // Assert
    expect(faturamento).toBe(600);
  });

  test("deve calcular taxa de ocupacao e retornar zero quando nao ha quartos", () => {
    // Arrange
    const hotelVazio = new ReservaHotel();
    const hotel = criarHotelComReservaPendente();
    hotel.cadastrarQuarto(criarQuartoBase({ numero: 202 }));

    // Act
    const taxaSemQuartos = hotelVazio.calcularTaxaDeOcupacao();
    const taxaComOcupacao = hotel.calcularTaxaDeOcupacao();

    // Assert
    expect(taxaSemQuartos).toBe(0);
    expect(taxaComOcupacao).toBe(50);
  });

  test("deve gerar relatorio consolidado do hotel", () => {
    // Arrange
    const hotel = criarHotelComReservaPendente();

    // Act
    const relatorio = hotel.gerarRelatorio();

    // Assert
    expect(relatorio).toEqual({
      totalQuartos: 1,
      quartosDisponiveis: 0,
      totalReservas: 1,
      faturamentoTotal: 600,
      taxaDeOcupacao: 100,
    });
  });
});