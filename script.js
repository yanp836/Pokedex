const pokeContainer = document.querySelector("#pokeContainer");
const qttPokemon = 1025;
let listaPokemon = []; // lista de objetos completos dos Pokémons
let cardsDOM = [];     // lista dos elementos DOM dos cards

const colorByType = {
    fire: '#FDDFDF',
    grass: '#DEFDE0',
    electric: '#FCF7DE',
    water: '#DEF3FD',
    ground: '#f4e7da',
    rock: '#d5d5d4',
    fairy: '#fceaff',
    poison: '#98d7a5',
    bug: '#f8d5a3',
    dragon: '#97b3e6',
    psychic: '#eaeda1',
    flying: '#F5F5F5',
    fighting: '#E6E0D4',
    normal: '#F5F5F5'
};

const mainTypes = Object.keys(colorByType);

// Cria todos os cards dos Pokémons
const makeCardsPokemon = async () => {
    for (let i = 1; i <= qttPokemon; i++) {
        await getPokemons(i);
    }

    // Ordena a lista pelo nome para que a busca binária funcione
    listaPokemon.sort((a, b) => a.name.localeCompare(b.name));
};

// Busca Pokémon na API e cria o card
const getPokemons = async (id) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
    const resp = await fetch(url);
    const data = await resp.json();
    listaPokemon.push(data);
    createCards(data);
};

// Cria o card no DOM e marca com dataset
    const createCards = (pokemon) => {
        const card = document.createElement('div');
        card.classList.add("pokemon");
        card.dataset.name = pokemon.name.toLowerCase(); // marcador para busca

        const pokeTypes = pokemon.types.map(type => type.type.name);
        const type = mainTypes.find(type => pokeTypes.indexOf(type) > -1);
        const color = colorByType[type];
        card.dataset.type = type; // ✅ agora o filtro funciona

        const name = pokemon.name[0].toUpperCase() + pokemon.name.slice(1);
        const id = pokemon.id.toString().padStart(3, '0');

        card.style.backgroundColor = color;

        card.innerHTML = `
        <div class="imgContainer">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" alt="${name}">
        </div>
        <div class="info">
            <span class="number">#${id}</span>
            <h3 class="name">${name}</h3>
            <small class="type">Type: <span>${type}</span></small>
        </div>
    `;

        pokeContainer.appendChild(card);
        cardsDOM.push(card);

    };

    // Busca binária e mostra apenas o Pokémon encontrado
    function verifyPokemon() {
        const pokemonABuscar = document.getElementById("buscar").value.toLowerCase();

        let ponteiroMenor = 0;
        let ponteiroMaior = listaPokemon.length - 1;
        let encontrou = false;

        while (ponteiroMenor <= ponteiroMaior) {
            const meio = Math.floor((ponteiroMenor + ponteiroMaior) / 2);
            const nomeMeio = listaPokemon[meio].name.toLowerCase();

            if (nomeMeio === pokemonABuscar) {
                encontrou = true;
                mostraPokemonEncontrado(pokemonABuscar);
                break;
            } else if (nomeMeio < pokemonABuscar) {
                ponteiroMenor = meio + 1;
            } else {
                ponteiroMaior = meio - 1;
            }
        }

        if (!encontrou) {
            alert(`Pokemon "${pokemonABuscar}" não foi encontrado.`);
        }
    }

    // Mostra apenas o card do Pokémon encontrado
    function mostraPokemonEncontrado(nome) {
        // Esconde todos os cards e mostra apenas o encontrado
        cardsDOM.forEach(card => {
            card.style.display = (card.dataset.name === nome.toLowerCase()) ? "block" : "none";
        });

        // Adiciona o botão "Mostrar todos" se não existir
        if (!document.querySelector("#mostrarCards")) {
            const botaoTodos = document.createElement("button");
            botaoTodos.textContent = "Mostrar todos";
            botaoTodos.id = "mostrarCards";
            botaoTodos.onclick = mostraTodosPokemons;
            pokeContainer.appendChild(botaoTodos);
        }
    }

    // Mostra todos os cards novamente
    function mostraTodosPokemons() {
        cardsDOM.forEach(card => card.style.display = "block");
        const botao = document.querySelector("#mostrarCards");
        if (botao) botao.remove();
    }


    function filtrarPorTipo() {
        const tipoSelecionado = document.getElementById("filtroTipo").value;
        cardsDOM.forEach(card => {
            if (tipoSelecionado === "todos" || card.dataset.type === tipoSelecionado) {
                card.style.display = "block"; // mostra o card
            } else {
                card.style.display = "none"; // esconde o card
            }
        });
    }
    // Inicia a criação dos cards
    makeCardsPokemon();

