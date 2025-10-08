const pokeContainer = document.querySelector("#pokeContainer");
const qttPokemon = 1025;
let listaPokemon = [];
let cardsDOM = [];

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

const makeCardsPokemon = async () => {
    for (let i = 1; i <= qttPokemon; i++) {
        await getPokemons(i);
    }
    listaPokemon.sort((a, b) => a.name.localeCompare(b.name));
};

const getPokemons = async (id) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
    const resp = await fetch(url);
    const data = await resp.json();
    listaPokemon.push(data);
    createCards(data);
};

const createCards = (pokemon) => {
    const card = document.createElement('div');
    card.classList.add("pokemon");
    card.dataset.name = pokemon.name.toLowerCase();
    card.dataset.types = pokemon.types.map(t => t.type.name).join(",");
    cardsDOM.push(card);

    const name = pokemon.name[0].toUpperCase() + pokemon.name.slice(1);
    const id = pokemon.id.toString().padStart(3, '0');
    const pokeTypes = pokemon.types.map(type => type.type.name);
    const type = mainTypes.find(type => pokeTypes.indexOf(type) > -1);
    const color = colorByType[type];

    card.style.backgroundColor = color;

    card.innerHTML = `
        <div class="imgContainer">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" alt="${name}">
        </div>
        <div class="info">
            <span class="number">#${id}</span>
            <h3 class="name">${name}</h3>
            <small class="type">Type: <span>${pokeTypes.join(', ')}</span></small>
        </div>
    `;

    pokeContainer.appendChild(card);
    card.addEventListener("click", () => mostrarDetalhesPokemon(pokemon));
};

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
        alert(`Pokémon "${pokemonABuscar}" não foi encontrado.`);
    }
}

function mostraPokemonEncontrado(nome) {
    cardsDOM.forEach(card => {
        card.style.display = (card.dataset.name === nome.toLowerCase()) ? "block" : "none";
    });

    if (!document.querySelector("#mostrarCards")) {
        const botaoTodos = document.createElement("button");
        botaoTodos.textContent = "Mostrar todos";
        botaoTodos.id = "mostrarCards";
        botaoTodos.onclick = mostraTodosPokemons;
        pokeContainer.appendChild(botaoTodos);
    }
}

function mostraTodosPokemons() {
    cardsDOM.forEach(card => card.style.display = "block");
    const botao = document.querySelector("#mostrarCards");
    if (botao) botao.remove();
}

function filtrarPorTipo() {
    const tipoSelecionado = document.getElementById("filtroTipo").value;
    cardsDOM.forEach(card => {
        const tipos = card.dataset.types.split(",");
        card.style.display = (tipoSelecionado === "todos" || tipos.includes(tipoSelecionado)) ? "block" : "none";
    });
}

async function mostrarDetalhesPokemon(pokemon) {
    // Remove modal antigo
    const antigoModal = document.querySelector(".modal");
    if (antigoModal) antigoModal.remove();

    const evolucoes = await buscarEvolucoes(pokemon);
    const nome = pokemon.name[0].toUpperCase() + pokemon.name.slice(1);
    const tipos = pokemon.types.map(t => t.type.name).join(", ");
    const habilidades = pokemon.abilities.map(a => a.ability.name).join(", ");
    const peso = pokemon.weight / 10;
    const altura = pokemon.height / 10;

    const modal = document.createElement("div");
    modal.classList.add("modal");

    // HTML das evoluções
    const evolucoesHTML = evolucoes.map(nomeEvo => {
        const poke = listaPokemon.find(p => p.name === nomeEvo);
        const idEvo = poke ? poke.id : "";
        return `
            <div class="evolucao">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idEvo}.png" alt="${nomeEvo}">
                <p>${nomeEvo[0].toUpperCase() + nomeEvo.slice(1)}</p>
            </div>
        `;
    }).join("");

    modal.innerHTML = `
        <div class="modal-content">
            <span class="fechar">&times;</span>
            <h2>${nome} (#${pokemon.id})</h2>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" alt="${nome}">
            <p><strong>Tipo:</strong> ${tipos}</p>
            <p><strong>Altura:</strong> ${altura} m</p>
            <p><strong>Peso:</strong> ${peso} kg</p>
            <p><strong>Habilidades:</strong> ${habilidades}</p>

            <h3>Evoluções</h3>
            <div class="evolucoes-container">${evolucoesHTML}</div>
        </div>
    `;

    document.body.appendChild(modal);

    // Fecha modal
    modal.querySelector(".fechar").addEventListener("click", () => modal.remove());
}

function coletarEvolucoes(chain, lista = []) {
    if (!chain) return lista;
    lista.push(chain.species.name);
    chain.evolves_to.forEach(evo => coletarEvolucoes(evo, lista));
    return lista;
}

async function buscarEvolucoes(pokemon) {
    const especieURL = `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}/`;
    const especieResp = await fetch(especieURL);
    const especieData = await especieResp.json();

    const evoResp = await fetch(especieData.evolution_chain.url);
    const evoData = await evoResp.json();

    return coletarEvolucoes(evoData.chain);
}

makeCardsPokemon();
