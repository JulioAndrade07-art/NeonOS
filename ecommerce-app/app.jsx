const { useState, useEffect, createContext, useContext } = React;

// --- DADOS MOCKADOS ---
const PRODUTOS = [
  {
    id: 1,
    nome: "Espada Energética",
    preco: 199.90,
    imagem: "https://images.unsplash.com/photo-1621508654686-809f23efdabc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    descricao: "Arma futurista com lâmina de plasma superaquecido. Corta qualquer liga metálica conhecida."
  },
  {
    id: 2,
    nome: "Reator Compacto Arc",
    preco: 499.90,
    imagem: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    descricao: "Fonte de energia portátil com fusão a frio. Ideal para exoesqueletos e viagens longas."
  },
  {
    id: 3,
    nome: "Drone Minerador Z-9",
    preco: 299.90,
    imagem: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    descricao: "Drone autônomo com IA neural adaptativa. Extrai minérios em asteroides de alta densidade."
  },
  {
    id: 4,
    nome: "Implante Neural V2",
    preco: 899.00,
    imagem: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    descricao: "Expanda sua capacidade cognitiva e acesse a rede diretamente pelo córtex cerebral."
  }
];

// --- CONTEXTO DO CARRINHO ---
const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('neon_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('neon_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (produto) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === produto.id);
      if (exists) {
        return prev.map(item => item.id === produto.id ? { ...item, qtde: item.qtde + 1 } : item);
      }
      return [...prev, { ...produto, qtde: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQtde = item.qtde + delta;
        return newQtde > 0 ? { ...item, qtde: newQtde } : item;
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, item) => acc + (item.preco * item.qtde), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qtde, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => useContext(CartContext);

// --- COMPONENTES UI ---
const Header = ({ navigate }) => {
  const { cartCount } = useCart();
  return (
    <header className="fixed top-0 w-full bg-[#0f0f1a]/90 backdrop-blur-md border-b border-[rgba(0,243,255,0.2)] z-50 p-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div 
          className="text-2xl font-black cursor-pointer neon-text-purple flex items-center gap-2"
          onClick={() => navigate('home')}
        >
          <iconify-icon icon="mdi:triangle-wave" width="30" className="text-[#00f3ff]"></iconify-icon>
          NEXUS<span className="text-white font-light">GEAR</span>
        </div>
        <div 
          className="relative cursor-pointer text-gray-300 hover:text-white transition-colors"
          onClick={() => navigate('cart')}
        >
          <iconify-icon icon="mdi:cart-outline" width="30"></iconify-icon>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#ff007f] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_#ff007f]">
              {cartCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

// --- PÁGINAS ---

const Home = ({ navigate }) => {
  return (
    <div className="animate-fade-in">
      <div className="py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-4 neon-text-purple tracking-wider">TECNOLOGIA DO FUTURO</h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">Equipe-se com o melhor hardware cyberpunk disponível no mercado clandestino.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRODUTOS.map(p => (
          <div key={p.id} className="glass-card overflow-hidden flex flex-col cursor-pointer group" onClick={() => navigate('product', p.id)}>
            <div className="h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] to-transparent z-10 opacity-80" />
              <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-4 flex-1 flex flex-col relative z-20">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:neon-text-blue transition-all">{p.nome}</h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{p.descricao}</p>
              <div className="mt-auto flex justify-between items-center">
                <span className="text-2xl font-black text-[#00f3ff]">R$ {p.preco.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Product = ({ id, navigate }) => {
  const produto = PRODUTOS.find(p => p.id === id);
  const { addToCart } = useCart();

  if (!produto) return <div className="text-center mt-20">Produto não encontrado.</div>;

  return (
    <div className="animate-fade-in flex flex-col md:flex-row gap-8 bg-[#151525] p-6 rounded-2xl neon-border">
      <div className="md:w-1/2 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(157,78,221,0.2)]">
        <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
      </div>
      <div className="md:w-1/2 flex flex-col justify-center">
        <h1 className="text-3xl md:text-5xl font-black mb-2 neon-text-blue">{produto.nome}</h1>
        <p className="text-xl text-gray-400 mb-6">{produto.descricao}</p>
        <div className="text-4xl font-bold text-white mb-8 border-l-4 border-[#ff007f] pl-4">
          R$ {produto.preco.toFixed(2)}
        </div>
        <div className="flex gap-4">
          <button 
            className="btn-neon flex-1 text-center py-3 flex items-center justify-center gap-2"
            onClick={() => {
              addToCart(produto);
              navigate('cart');
            }}
          >
            <iconify-icon icon="mdi:cart-plus"></iconify-icon> Adicionar ao Carrinho
          </button>
          <button className="px-6 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors" onClick={() => navigate('home')}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

const Cart = ({ navigate }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold mb-8 neon-text-purple border-b border-gray-800 pb-4">Seu Carrinho</h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <iconify-icon icon="mdi:cart-remove" width="60" className="mb-4 opacity-50"></iconify-icon>
          <p className="text-xl mb-6">Seu carrinho está vazio.</p>
          <button className="btn-neon" onClick={() => navigate('home')}>Explorar Loja</button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 flex flex-col gap-4">
            {cart.map(item => (
              <div key={item.id} className="glass-card flex items-center p-4 gap-4">
                <img src={item.imagem} alt={item.nome} className="w-20 h-20 rounded-md object-cover border border-gray-700" />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white">{item.nome}</h4>
                  <p className="text-[#00f3ff] font-semibold">R$ {item.preco.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3 bg-[#0a0a10] rounded-lg px-3 py-1 border border-gray-700">
                  <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-white">-</button>
                  <span className="font-bold w-6 text-center">{item.qtde}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-white">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400 hover:scale-110 transition-transform p-2">
                  <iconify-icon icon="mdi:trash-can" width="24"></iconify-icon>
                </button>
              </div>
            ))}
          </div>
          <div className="lg:w-1/3">
            <div className="bg-[#151525] p-6 rounded-2xl neon-border sticky top-24">
              <h3 className="text-xl font-bold mb-4 text-white">Resumo do Pedido</h3>
              <div className="flex justify-between mb-2 text-gray-400">
                <span>Subtotal</span>
                <span>R$ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-6 text-gray-400">
                <span>Frete (Hiper-salto)</span>
                <span className="text-green-400">Grátis</span>
              </div>
              <div className="flex justify-between font-black text-2xl text-white border-t border-gray-700 pt-4 mb-8">
                <span>Total</span>
                <span className="text-[#ff007f]">R$ {cartTotal.toFixed(2)}</span>
              </div>
              <button className="btn-neon w-full py-4 text-lg" onClick={() => navigate('checkout')}>
                Finalizar Compra
              </button>
              <button className="w-full text-center mt-4 text-gray-500 hover:text-white text-sm" onClick={() => navigate('home')}>
                Continuar Comprando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Checkout = ({ navigate }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pixCode, setPixCode] = useState(null);

  // Redirecionar se vazio
  useEffect(() => {
    if (cart.length === 0 && step === 1) navigate('home');
  }, [cart]);

  // Simulação de chamada de backend para o SDK do Mercado Pago
  const processPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    /* 
      // EXEMPLO DE COMO SERIA NO BACKEND REAL (Node.js + Express):
      import { MercadoPagoConfig, Preference } from 'mercadopago';
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
      
      app.post('/create-payment', async (req, res) => {
         const preference = new Preference(client);
         const response = await preference.create({
           body: {
             items: req.body.items,
             back_urls: { success: "https://meusite.com/success" },
             auto_return: "approved",
           }
         });
         res.json({ id: response.id, init_point: response.init_point });
      });
    */

    // Simulando tempo de rede e processamento
    setTimeout(() => {
      setLoading(false);
      setStep(2); // Vai para tela de sucesso/qr code simulado
      setPixCode("00020126440014BR.GOV.BCB.PIX0114+5511999999999...SIMULACAO...6304");
      clearCart();
    }, 2500);
  };

  if (step === 2) {
    return (
      <div className="max-w-2xl mx-auto text-center bg-[#151525] p-10 rounded-2xl neon-border">
        <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <iconify-icon icon="mdi:check-bold" width="40"></iconify-icon>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Pedido Registrado!</h2>
        <p className="text-gray-400 mb-8">Pague via PIX usando o código abaixo para liberação imediata da sua remessa.</p>
        
        <div className="bg-[#0f0f1a] p-6 rounded-lg border border-[#00f3ff]/30 mb-8 inline-block">
          <iconify-icon icon="mdi:qrcode-scan" width="120" className="text-[#00f3ff]"></iconify-icon>
        </div>
        
        <div className="bg-gray-900 rounded p-3 text-xs text-gray-500 font-mono break-all mb-8 select-all">
          {pixCode}
        </div>
        
        <button className="btn-neon px-8" onClick={() => navigate('home')}>Voltar ao Início</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 neon-text-purple">Finalizar Checkout de Segurança</h2>
      <div className="flex flex-col md:flex-row gap-8">
        
        <form onSubmit={processPayment} className="md:w-2/3 glass-card p-6 flex flex-col gap-4">
          <h3 className="text-xl font-semibold mb-2 text-white border-b border-gray-700 pb-2">Dados de Entrega (Coordenadas)</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Nome Completo</label>
              <input required type="text" className="w-full bg-[#0a0a10] border border-gray-700 rounded p-3 text-white focus:border-[#00f3ff] focus:outline-none transition-colors" placeholder="Ex: Hiro Protagonist"/>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-gray-400 mb-1">E-mail</label>
              <input required type="email" className="w-full bg-[#0a0a10] border border-gray-700 rounded p-3 text-white focus:border-[#00f3ff] focus:outline-none transition-colors" placeholder="hiro@metaverse.net"/>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-gray-400 mb-1">Setor / Planeta</label>
              <input required type="text" className="w-full bg-[#0a0a10] border border-gray-700 rounded p-3 text-white focus:border-[#00f3ff] focus:outline-none transition-colors" placeholder="Setor 7G"/>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Ponto de Referência</label>
              <input required type="text" className="w-full bg-[#0a0a10] border border-gray-700 rounded p-3 text-white focus:border-[#00f3ff] focus:outline-none transition-colors" placeholder="Prédio da megacorporação"/>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mt-4 mb-2 text-white border-b border-gray-700 pb-2">Método de Pagamento</h3>
          <div className="flex gap-4">
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="payment" defaultChecked className="peer hidden" />
              <div className="border border-gray-700 rounded p-4 text-center peer-checked:border-[#00f3ff] peer-checked:bg-[#00f3ff]/10 hover:bg-gray-800 transition-all">
                <iconify-icon icon="mdi:qrcode" width="24" className="mb-2 block mx-auto text-[#00f3ff]"></iconify-icon>
                <div className="font-bold text-sm">Transferência Neural (PIX)</div>
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="payment" className="peer hidden" />
              <div className="border border-gray-700 rounded p-4 text-center peer-checked:border-[#ff007f] peer-checked:bg-[#ff007f]/10 hover:bg-gray-800 transition-all">
                <iconify-icon icon="mdi:credit-card-outline" width="24" className="mb-2 block mx-auto text-[#ff007f]"></iconify-icon>
                <div className="font-bold text-sm">Créditos de Cartão</div>
              </div>
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn-neon mt-6 py-4 flex justify-center items-center gap-3">
            {loading ? <div className="loader w-6 h-6 border-2"></div> : "Confirmar e Pagar"}
          </button>
        </form>

        <div className="md:w-1/3">
          <div className="bg-[#151525] p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-bold mb-4 text-white">Resumo</h3>
            <div className="flex flex-col gap-3 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
                  <span className="text-gray-300"><span className="text-gray-500 mr-2">{item.qtde}x</span>{item.nome}</span>
                  <span className="text-white font-mono">R$ {(item.preco * item.qtde).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-black text-xl text-white pt-2">
              <span>Total a pagar</span>
              <span className="text-[#00f3ff]">R$ {cartTotal.toFixed(2)}</span>
            </div>
            
            <div className="mt-8 p-4 bg-[#0a0a10] rounded text-xs text-gray-500 border border-gray-800">
              <p className="mb-2 flex items-center gap-1"><iconify-icon icon="mdi:shield-check" className="text-green-500"></iconify-icon> Conexão Segura AES-256</p>
              <p>Os pagamentos são processados em ambiente seguro. Criptografia ponta a ponta ativa.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};


// --- MAIN APP ---
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentId, setCurrentId] = useState(null);

  const navigate = (page, id = null) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentId(id);
    setCurrentPage(page);
  };

  return (
    <CartProvider>
      <Header navigate={navigate} />

      <main className="max-w-6xl mx-auto p-4 pt-28 pb-12 min-h-screen">
        {currentPage === 'home' && <Home navigate={navigate} />}
        {currentPage === 'product' && <Product id={currentId} navigate={navigate} />}
        {currentPage === 'cart' && <Cart navigate={navigate} />}
        {currentPage === 'checkout' && <Checkout navigate={navigate} />}
      </main>

      <footer className="border-t border-gray-800 py-8 text-center text-gray-600 text-sm">
        <p>NexusGear E-Commerce © 2077. Todos os direitos reservados.</p>
        <p className="mt-2 text-xs">Simulação para Portfólio (Construído via CDN sem Node.js)</p>
        <div className="flex justify-center gap-4 mt-4 opacity-50">
          <iconify-icon icon="mdi:github" width="24"></iconify-icon>
          <iconify-icon icon="mdi:linkedin" width="24"></iconify-icon>
        </div>
      </footer>
    </CartProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
