class GerenciadorEstoque {
  constructor() {
    this.produtos = [];
  }

  adicionarProduto(produto) {
    if (!produto || !produto.id || !produto.nome) return false;
    if (this.buscarPorId(produto.id)) return false;

    this.produtos.push({
      id: produto.id,
      nome: produto.nome,
      quantidade: produto.quantidade || 0,
      preco: produto.preco || 0,
      categoria: produto.categoria || "geral",
      ativo: true,
    });

    return true;
  }

  removerProduto(id) {
    const produto = this.buscarPorId(id);
    if (!produto) return false;

    this.produtos = this.produtos.filter(
      (produtoAtual) => produtoAtual.id !== id
    );
    return true;
  }

  buscarPorId(id) {
    return (
      this.produtos.find((produtoAtual) => produtoAtual.id === id) || null
    );
  }

  buscarPorCategoria(categoria) {
    return this.produtos.filter(
      (produtoAtual) => produtoAtual.categoria === categoria
    );
  }

  entrada(id, quantidade) {
    if (quantidade <= 0) return false;

    const produto = this.buscarPorId(id);
    if (!produto) return false;

    produto.quantidade += quantidade;
    return true;
  }

  saida(id, quantidade) {
    if (quantidade <= 0) return false;

    const produto = this.buscarPorId(id);
    if (!produto) return false;
    if (produto.quantidade < quantidade) return false;

    produto.quantidade -= quantidade;
    return true;
  }

  atualizarPreco(id, novoPreco) {
    if (novoPreco < 0) return false;

    const produto = this.buscarPorId(id);
    if (!produto) return false;

    produto.preco = novoPreco;
    return true;
  }

  aplicarDesconto(id, percentual) {
    if (percentual <= 0 || percentual > 100) return false;

    const produto = this.buscarPorId(id);
    if (!produto) return false;

    produto.preco = produto.preco - (produto.preco * percentual) / 100;
    return true;
  }

  desativarProduto(id) {
    const produto = this.buscarPorId(id);
    if (!produto) return false;

    produto.ativo = false;
    return true;
  }

  ativarProduto(id) {
    const produto = this.buscarPorId(id);
    if (!produto) return false;

    produto.ativo = true;
    return true;
  }

  estaEmEstoque(id) {
    const produto = this.buscarPorId(id);
    return !!produto && produto.quantidade > 0;
  }

  listarAtivos() {
    return this.produtos.filter((produtoAtual) => produtoAtual.ativo);
  }

  listarSemEstoque() {
    return this.produtos.filter(
      (produtoAtual) => produtoAtual.quantidade === 0
    );
  }

  calcularValorTotalEstoque() {
    return this.produtos.reduce(
      (total, produtoAtual) =>
        total + produtoAtual.preco * produtoAtual.quantidade,
      0
    );
  }

  calcularQuantidadeTotal() {
    return this.produtos.reduce(
      (total, produtoAtual) => total + produtoAtual.quantidade,
      0
    );
  }

  produtoMaisCaro() {
    if (this.produtos.length === 0) return null;

    return this.produtos.reduce((maisCaro, atual) =>
      atual.preco > maisCaro.preco ? atual : maisCaro
    );
  }

  produtoMaisBarato() {
    if (this.produtos.length === 0) return null;

    return this.produtos.reduce((maisBarato, atual) =>
      atual.preco < maisBarato.preco ? atual : maisBarato
    );
  }

  transferirEstoque(idOrigem, idDestino, quantidade) {
    if (quantidade <= 0) return false;

    const origem = this.buscarPorId(idOrigem);
    const destino = this.buscarPorId(idDestino);

    if (!origem || !destino) return false;
    if (origem.quantidade < quantidade) return false;

    origem.quantidade -= quantidade;
    destino.quantidade += quantidade;
    return true;
  }

  gerarRelatorio() {
    return {
      totalProdutos: this.produtos.length,
      totalAtivos: this.listarAtivos().length,
      quantidadeTotal: this.calcularQuantidadeTotal(),
      valorTotal: this.calcularValorTotalEstoque(),
      semEstoque: this.listarSemEstoque().length,
    };
  }

  limparEstoque() {
    this.produtos = [];
  }
}

module.exports = GerenciadorEstoque;