(function () {

  const pokeTypes = {};

  const pokeList = [],
        pokeCount = 60,
        localStorageName = 'letsCodePoke',
        baseURL = 'https://pokeapi.co/api/v2/pokemon';

  function getPokemons () {
    return Promise.all(
      Array.from({ length: pokeCount }, (_, i) => {
        return fetch(`${baseURL}/${i + 1}`)
          .then(response => response.json())
          .catch(error => console.log(error));
      })
    );
  }

  function pokeMap (list) {
    const pokeMapped = list
      .map(singlePoke => {
        let { id, name, types } = singlePoke;

        return {
          id,
          name,
          types: types.map(obj => obj.type.name)
        };
      });

    return pokeMapped;
  }

  function pokeFiltering (list) {
    return list;
  }

  function pokeDraw () {
    const filteredPoke = pokeFiltering(pokeList);

    pokeUndraw();

    document.querySelector('#main').innerHTML = filteredPoke.map(pokeTemplate).join('');

    document.querySelectorAll('#main .pokemon').forEach(poke => {
      const pokeID = poke.dataset.id;

      poke.querySelector('[data-action="delete"]').addEventListener('click', function () {
        deletePokemon(pokeID);
      })
    });
  }

  function pokeTemplate (pokeInfo) {
    const { id, name, types } = pokeInfo;

    return `
      <div class="pokemon single ${types.join(' ')}" data-id="${id}">
        <div class="pokemon__wrapper">
          <header class="pokemon__wrapper-header">
            <span class="tooltip" data-action="delete">
              Delete
            </span>

            <figure class="pokefigure">
              <img class="pokefigure__image" src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${String(id).padStart(3, '0')}.png" loading="lazy" alt="${name}" />
            </figure>
          </header>
          <footer class="pokemon__wrapper-footer">
            <h3 class="pokename">${name}</h3>
            <div class="poketypes${ types.length > 1 ? ' multi' : ' single' }">
              ${ types.map(type => `
                <div class="poketypes__single ${type}" data-type="${type}" title="APLICAR FILTRO PARA ${type.toUpperCase()}">
                  ${type}
                </div>`
              ).join('') }
            </div>
          </footer>
        </div>
      </div>
    `;
  }

  function pokeUndraw () {
    let child;

    const container = document.querySelector('#main');

    while (child = container.childNodes.firstChild) {
      container.removeChild(child);
    }
  }

  function deletePokemon (id) {
    const existingPoke = JSON.parse(localStorage.getItem(localStorageName));

    localStorage.setItem(localStorageName, JSON.stringify(
      existingPoke.filter(poke => poke.id !== parseInt(id))
    ));

    removeASinglePokeFromCanvas(id);

    clearCounter();
  }

  function removeASinglePokeFromCanvas (id) {
    const container = document.querySelector('#main');

    const target = container.querySelector(`[data-id="${id}"]`);

    container.removeChild(target);
  }

  function clearCounter () {
    while (pokeList.length > 0) {
      pokeList.splice(0, 1);
    }

    pokeList.push(...JSON.parse(localStorage.getItem(localStorageName)));

    [...Object.keys(pokeTypes)].forEach( key => pokeTypes[key] = 0 );

    showPokeTypeByQuantity(pokeList);
  }

  function showPokeTypeByQuantity (from) {
    for (let i = 0, len = from.length; i < len; i++) {
      const singlePoke = from[i];

      singlePoke.types.forEach(type => {
        if (pokeTypes[type]) {
          pokeTypes[type] += 1;
        } else {
          pokeTypes[type] = 1;
        }
      });
    }

    drawPokeTypes(from);
  }

  function drawPokeTypes (from) {
    document.querySelector('#aside-top').innerHTML = Object.entries(pokeTypes).map(type => {
      const [ typeName, typeCount ] = type;

      return `
        <div class="typecounter" title="${typeName}">
          <div class="typecounter__square ${typeName}"></div>
          <div class="typecounter__text">
            ${typeCount}
          </div>
        </div>
      `
    }).join('');
  }

  async function main () {
    if (localStorage.getItem(localStorageName)) {
      pokeList.push(...JSON.parse(localStorage.getItem(localStorageName)));

      if (pokeList.length <= 0) {
        localStorage.removeItem(localStorageName);

        return main();
      }
    } else {
      pokeList.push(...pokeMap(await getPokemons()));

      localStorage.setItem(localStorageName, JSON.stringify(pokeList));
    }

    showPokeTypeByQuantity(pokeList);

    pokeDraw();
  }

  main();

})();