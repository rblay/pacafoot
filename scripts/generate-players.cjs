/**
 * Generate realistic Serie A 2024-25 player data.
 * Run: node scripts/generate-players.cjs
 * Output: public/data/leagues/serie_a/players.json
 */
const fs = require('fs');
const path = require('path');

// Key players per team with real names and stats
const teamRosters = {
  flamengo: {
    stars: [
      { name: 'Agustín Rossi', pos: 'G', rating: 78, age: 28, nat: 'ARG', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Léo Pereira', pos: 'Z', rating: 77, age: 27, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Fabrício Bruno', pos: 'Z', rating: 75, age: 28, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Pas'] },
      { name: 'Ayrton Lucas', pos: 'L', rating: 74, age: 26, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
      { name: 'Varela', pos: 'L', rating: 73, age: 30, nat: 'URU', role: 'Normal', chars: ['Mar', 'Pas'] },
      { name: 'Erick Pulgar', pos: 'M', rating: 78, age: 30, nat: 'CHI', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Gerson', pos: 'M', rating: 84, age: 27, nat: 'BRA', role: 'Normal', chars: ['Pas', 'Dri'] },
      { name: 'De la Cruz', pos: 'M', rating: 82, age: 26, nat: 'URU', role: 'Ofensivo', chars: ['Pas', 'Chu'] },
      { name: 'Arrascaeta', pos: 'M', rating: 83, age: 30, nat: 'URU', role: 'Ofensivo', chars: ['Pas', 'Dri'] },
      { name: 'Luiz Araújo', pos: 'A', rating: 75, age: 27, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Fin'] },
      { name: 'Pedro', pos: 'A', rating: 84, age: 27, nat: 'BRA', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
      { name: 'Bruno Henrique', pos: 'A', rating: 74, age: 33, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Fin'] },
      { name: 'Everton Cebolinha', pos: 'A', rating: 76, age: 28, nat: 'BRA', role: 'Ofensivo', chars: ['Dri', 'Vel'] },
    ],
    fill: { avgRating: 62, count: 12 }
  },
  palmeiras: {
    stars: [
      { name: 'Weverton', pos: 'G', rating: 79, age: 36, nat: 'BRA', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Gustavo Gómez', pos: 'Z', rating: 80, age: 31, nat: 'PAR', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Murilo', pos: 'Z', rating: 74, age: 26, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Vel'] },
      { name: 'Marcos Rocha', pos: 'L', rating: 72, age: 35, nat: 'BRA', role: 'Normal', chars: ['Mar', 'Vel'] },
      { name: 'Piquerez', pos: 'L', rating: 75, age: 25, nat: 'URU', role: 'Ofensivo', chars: ['Pas', 'Vel'] },
      { name: 'Zé Rafael', pos: 'M', rating: 77, age: 30, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Richard Ríos', pos: 'M', rating: 76, age: 24, nat: 'COL', role: 'Normal', chars: ['Dri', 'Pas'] },
      { name: 'Raphael Veiga', pos: 'M', rating: 82, age: 29, nat: 'BRA', role: 'Ofensivo', chars: ['Chu', 'Pas'] },
      { name: 'Estêvão', pos: 'A', rating: 81, age: 17, nat: 'BRA', role: 'Ofensivo', chars: ['Dri', 'Vel'] },
      { name: 'Dudu', pos: 'A', rating: 78, age: 32, nat: 'BRA', role: 'Ofensivo', chars: ['Dri', 'Fin'] },
      { name: 'Endrick', pos: 'A', rating: 79, age: 18, nat: 'BRA', role: 'Ofensivo', chars: ['Fin', 'Vel'] },
      { name: 'Rony', pos: 'A', rating: 75, age: 29, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Fin'] },
      { name: 'Flaco López', pos: 'A', rating: 74, age: 24, nat: 'ARG', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
    ],
    fill: { avgRating: 63, count: 12 }
  },
  botafogo: {
    stars: [
      { name: 'John', pos: 'G', rating: 76, age: 28, nat: 'BRA', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Alexander Barboza', pos: 'Z', rating: 80, age: 30, nat: 'ARG', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Bastos', pos: 'Z', rating: 75, age: 33, nat: 'ANG', role: 'Defensivo', chars: ['Mar', 'Pas'] },
      { name: 'Damián Suárez', pos: 'L', rating: 73, age: 35, nat: 'URU', role: 'Normal', chars: ['Mar', 'Pas'] },
      { name: 'Cuiabano', pos: 'L', rating: 70, age: 23, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
      { name: 'Gregore', pos: 'M', rating: 78, age: 29, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Marlon Freitas', pos: 'M', rating: 76, age: 29, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Chu'] },
      { name: 'Thiago Almada', pos: 'M', rating: 82, age: 23, nat: 'ARG', role: 'Ofensivo', chars: ['Dri', 'Pas'] },
      { name: 'Savarino', pos: 'A', rating: 80, age: 27, nat: 'VEN', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
      { name: 'Luiz Henrique', pos: 'A', rating: 81, age: 23, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
      { name: 'Igor Jesus', pos: 'A', rating: 75, age: 23, nat: 'BRA', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
      { name: 'Tiquinho Soares', pos: 'A', rating: 76, age: 33, nat: 'BRA', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
    ],
    fill: { avgRating: 62, count: 13 }
  },
  fortaleza: {
    stars: [
      { name: 'João Ricardo', pos: 'G', rating: 75, age: 34, nat: 'BRA', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Brítez', pos: 'Z', rating: 73, age: 28, nat: 'ARG', role: 'Defensivo', chars: ['Mar', 'Vel'] },
      { name: 'Cardona', pos: 'Z', rating: 72, age: 31, nat: 'COL', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Tinga', pos: 'L', rating: 72, age: 25, nat: 'BRA', role: 'Normal', chars: ['Vel', 'Mar'] },
      { name: 'Pochettino', pos: 'M', rating: 79, age: 28, nat: 'ARG', role: 'Ofensivo', chars: ['Chu', 'Pas'] },
      { name: 'Hércules', pos: 'M', rating: 74, age: 23, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Vel'] },
      { name: 'Moisés', pos: 'M', rating: 77, age: 30, nat: 'BRA', role: 'Ofensivo', chars: ['Dri', 'Pas'] },
      { name: 'Lucero', pos: 'A', rating: 80, age: 28, nat: 'ARG', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
      { name: 'Yago Pikachu', pos: 'L', rating: 74, age: 32, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Chu'] },
      { name: 'Breno Lopes', pos: 'A', rating: 72, age: 28, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
    ],
    fill: { avgRating: 60, count: 15 }
  },
  internacional: {
    stars: [
      { name: 'Rochet', pos: 'G', rating: 79, age: 27, nat: 'URU', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Vitão', pos: 'Z', rating: 75, age: 24, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Pas'] },
      { name: 'Mercado', pos: 'Z', rating: 74, age: 36, nat: 'ARG', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Renê', pos: 'L', rating: 71, age: 31, nat: 'BRA', role: 'Normal', chars: ['Mar', 'Pas'] },
      { name: 'Bustos', pos: 'L', rating: 73, age: 26, nat: 'ARG', role: 'Ofensivo', chars: ['Vel', 'Pas'] },
      { name: 'Fernando', pos: 'M', rating: 76, age: 35, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Alan Patrick', pos: 'M', rating: 80, age: 32, nat: 'BRA', role: 'Ofensivo', chars: ['Pas', 'Chu'] },
      { name: 'Mauricio', pos: 'M', rating: 75, age: 23, nat: 'BRA', role: 'Ofensivo', chars: ['Dri', 'Pas'] },
      { name: 'Borré', pos: 'A', rating: 79, age: 28, nat: 'COL', role: 'Ofensivo', chars: ['Fin', 'Vel'] },
      { name: 'Valencia', pos: 'A', rating: 80, age: 28, nat: 'ECU', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
      { name: 'Wesley', pos: 'A', rating: 73, age: 24, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
    ],
    fill: { avgRating: 61, count: 14 }
  },
  'sao-paulo': {
    stars: [
      { name: 'Rafael', pos: 'G', rating: 76, age: 34, nat: 'BRA', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Arboleda', pos: 'Z', rating: 76, age: 32, nat: 'ECU', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Beraldo', pos: 'Z', rating: 73, age: 20, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Vel'] },
      { name: 'Rafinha', pos: 'L', rating: 73, age: 38, nat: 'BRA', role: 'Normal', chars: ['Pas', 'Mar'] },
      { name: 'Welington', pos: 'L', rating: 71, age: 23, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
      { name: 'Alisson', pos: 'M', rating: 78, age: 31, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Chu'] },
      { name: 'Pablo Maia', pos: 'M', rating: 74, age: 22, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'James Rodríguez', pos: 'M', rating: 79, age: 33, nat: 'COL', role: 'Ofensivo', chars: ['Pas', 'Chu'] },
      { name: 'Lucas Moura', pos: 'A', rating: 80, age: 32, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
      { name: 'Calleri', pos: 'A', rating: 79, age: 30, nat: 'ARG', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
      { name: 'Luciano', pos: 'A', rating: 76, age: 31, nat: 'BRA', role: 'Ofensivo', chars: ['Fin', 'Chu'] },
    ],
    fill: { avgRating: 62, count: 14 }
  },
  corinthians: {
    stars: [
      { name: 'Cássio', pos: 'G', rating: 77, age: 37, nat: 'BRA', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Félix Torres', pos: 'Z', rating: 74, age: 27, nat: 'ECU', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Cacá', pos: 'Z', rating: 71, age: 25, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Vel'] },
      { name: 'Fagner', pos: 'L', rating: 72, age: 34, nat: 'BRA', role: 'Normal', chars: ['Mar', 'Vel'] },
      { name: 'Hugo', pos: 'L', rating: 70, age: 25, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Pas'] },
      { name: 'Raniele', pos: 'M', rating: 72, age: 27, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Rodrigo Garro', pos: 'M', rating: 80, age: 26, nat: 'ARG', role: 'Ofensivo', chars: ['Pas', 'Dri'] },
      { name: 'Renato Augusto', pos: 'M', rating: 74, age: 36, nat: 'BRA', role: 'Ofensivo', chars: ['Pas', 'Chu'] },
      { name: 'Memphis Depay', pos: 'A', rating: 83, age: 30, nat: 'HOL', role: 'Ofensivo', chars: ['Fin', 'Dri'] },
      { name: 'Yuri Alberto', pos: 'A', rating: 79, age: 23, nat: 'BRA', role: 'Ofensivo', chars: ['Fin', 'Vel'] },
      { name: 'Romero', pos: 'A', rating: 75, age: 32, nat: 'PAR', role: 'Ofensivo', chars: ['Vel', 'Fin'] },
    ],
    fill: { avgRating: 60, count: 14 }
  },
  bahia: {
    stars: [
      { name: 'Marcos Felipe', pos: 'G', rating: 74, age: 27, nat: 'BRA', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Gabriel Xavier', pos: 'Z', rating: 74, age: 23, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Kanu', pos: 'Z', rating: 72, age: 27, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Vel'] },
      { name: 'Gilberto', pos: 'L', rating: 71, age: 30, nat: 'BRA', role: 'Normal', chars: ['Vel', 'Mar'] },
      { name: 'Caio Alexandre', pos: 'M', rating: 73, age: 24, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Jean Lucas', pos: 'M', rating: 75, age: 26, nat: 'BRA', role: 'Normal', chars: ['Pas', 'Dri'] },
      { name: 'Everton Ribeiro', pos: 'M', rating: 77, age: 35, nat: 'BRA', role: 'Ofensivo', chars: ['Pas', 'Dri'] },
      { name: 'Cauly', pos: 'M', rating: 78, age: 28, nat: 'BRA', role: 'Ofensivo', chars: ['Dri', 'Pas'] },
      { name: 'Thaciano', pos: 'A', rating: 74, age: 29, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Fin'] },
      { name: 'Everaldo', pos: 'A', rating: 73, age: 25, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
    ],
    fill: { avgRating: 59, count: 15 }
  },
  cruzeiro: {
    stars: [
      { name: 'Anderson', pos: 'G', rating: 74, age: 25, nat: 'BRA', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Zé Ivaldo', pos: 'Z', rating: 73, age: 26, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'João Marcelo', pos: 'Z', rating: 71, age: 22, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Vel'] },
      { name: 'William', pos: 'L', rating: 72, age: 29, nat: 'BRA', role: 'Normal', chars: ['Vel', 'Mar'] },
      { name: 'Marlon', pos: 'L', rating: 70, age: 27, nat: 'BRA', role: 'Normal', chars: ['Mar', 'Pas'] },
      { name: 'Lucas Romero', pos: 'M', rating: 74, age: 29, nat: 'ARG', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Matheus Pereira', pos: 'M', rating: 79, age: 28, nat: 'BRA', role: 'Ofensivo', chars: ['Pas', 'Dri'] },
      { name: 'Álvaro Barreal', pos: 'M', rating: 73, age: 24, nat: 'ARG', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
      { name: 'Robert', pos: 'A', rating: 72, age: 26, nat: 'BRA', role: 'Ofensivo', chars: ['Fin', 'Vel'] },
      { name: 'Nikão', pos: 'A', rating: 71, age: 32, nat: 'BRA', role: 'Ofensivo', chars: ['Dri', 'Fin'] },
    ],
    fill: { avgRating: 58, count: 15 }
  },
  'vasco-da-gama': {
    stars: [
      { name: 'Léo Jardim', pos: 'G', rating: 74, age: 28, nat: 'BRA', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Maicon', pos: 'Z', rating: 73, age: 34, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Léo', pos: 'Z', rating: 72, age: 27, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Vel'] },
      { name: 'Paulo Henrique', pos: 'L', rating: 71, age: 26, nat: 'BRA', role: 'Normal', chars: ['Vel', 'Mar'] },
      { name: 'Lucas Piton', pos: 'L', rating: 72, age: 24, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Pas'] },
      { name: 'Sforza', pos: 'M', rating: 72, age: 24, nat: 'ARG', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Dimitri Payet', pos: 'M', rating: 77, age: 37, nat: 'FRA', role: 'Ofensivo', chars: ['Pas', 'Chu'] },
      { name: 'Praxedes', pos: 'M', rating: 71, age: 22, nat: 'BRA', role: 'Ofensivo', chars: ['Dri', 'Pas'] },
      { name: 'Vegetti', pos: 'A', rating: 76, age: 35, nat: 'ARG', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
      { name: 'David', pos: 'A', rating: 72, age: 28, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
    ],
    fill: { avgRating: 57, count: 15 }
  },
  'atletico-mineiro': {
    stars: [
      { name: 'Everson', pos: 'G', rating: 77, age: 33, nat: 'BRA', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Jemerson', pos: 'Z', rating: 74, age: 32, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Junior Alonso', pos: 'Z', rating: 76, age: 31, nat: 'PAR', role: 'Defensivo', chars: ['Mar', 'Pas'] },
      { name: 'Guilherme Arana', pos: 'L', rating: 76, age: 27, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Pas'] },
      { name: 'Otávio', pos: 'M', rating: 76, age: 29, nat: 'BRA', role: 'Normal', chars: ['Pas', 'Dri'] },
      { name: 'Scarpa', pos: 'M', rating: 80, age: 30, nat: 'BRA', role: 'Ofensivo', chars: ['Pas', 'Chu'] },
      { name: 'Battaglia', pos: 'M', rating: 73, age: 28, nat: 'ARG', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Hulk', pos: 'A', rating: 82, age: 37, nat: 'BRA', role: 'Ofensivo', chars: ['Chu', 'Fin'] },
      { name: 'Paulinho', pos: 'A', rating: 80, age: 23, nat: 'BRA', role: 'Ofensivo', chars: ['Fin', 'Vel'] },
      { name: 'Cadu', pos: 'A', rating: 71, age: 20, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
    ],
    fill: { avgRating: 61, count: 15 }
  },
  gremio: {
    stars: [
      { name: 'Marchesín', pos: 'G', rating: 77, age: 36, nat: 'ARG', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Rodrigo Ely', pos: 'Z', rating: 73, age: 31, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Geromel', pos: 'Z', rating: 74, age: 38, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Pas'] },
      { name: 'João Pedro', pos: 'L', rating: 71, age: 26, nat: 'BRA', role: 'Normal', chars: ['Vel', 'Mar'] },
      { name: 'Reinaldo', pos: 'L', rating: 72, age: 34, nat: 'BRA', role: 'Ofensivo', chars: ['Chu', 'Pas'] },
      { name: 'Villasanti', pos: 'M', rating: 78, age: 26, nat: 'PAR', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Dodi', pos: 'M', rating: 72, age: 25, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Vel'] },
      { name: 'Cristaldo', pos: 'M', rating: 79, age: 28, nat: 'ARG', role: 'Ofensivo', chars: ['Dri', 'Pas'] },
      { name: 'Soteldo', pos: 'A', rating: 78, age: 27, nat: 'VEN', role: 'Ofensivo', chars: ['Dri', 'Vel'] },
      { name: 'Diego Costa', pos: 'A', rating: 74, age: 35, nat: 'BRA', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
      { name: 'Pavón', pos: 'A', rating: 73, age: 28, nat: 'ARG', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
    ],
    fill: { avgRating: 59, count: 14 }
  },
  fluminense: {
    stars: [
      { name: 'Fábio', pos: 'G', rating: 75, age: 43, nat: 'BRA', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Nino', pos: 'Z', rating: 75, age: 27, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Manoel', pos: 'Z', rating: 72, age: 33, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Samuel Xavier', pos: 'L', rating: 73, age: 34, nat: 'BRA', role: 'Normal', chars: ['Mar', 'Vel'] },
      { name: 'Marcelo', pos: 'L', rating: 74, age: 36, nat: 'BRA', role: 'Ofensivo', chars: ['Pas', 'Dri'] },
      { name: 'André', pos: 'M', rating: 76, age: 23, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Ganso', pos: 'M', rating: 78, age: 35, nat: 'BRA', role: 'Ofensivo', chars: ['Pas', 'Dri'] },
      { name: 'Jhon Arias', pos: 'M', rating: 79, age: 27, nat: 'COL', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
      { name: 'Cano', pos: 'A', rating: 79, age: 36, nat: 'ARG', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
      { name: 'Keno', pos: 'A', rating: 72, age: 34, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
    ],
    fill: { avgRating: 58, count: 15 }
  },
  juventude: {
    stars: [
      { name: 'Gabriel', pos: 'G', rating: 71, age: 29, nat: 'BRA', role: 'Defensivo', chars: ['Ref'] },
      { name: 'Rodrigo Sam', pos: 'Z', rating: 68, age: 25, nat: 'BRA', role: 'Defensivo', chars: ['Mar'] },
      { name: 'Danilo Boza', pos: 'Z', rating: 67, age: 27, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'João Lucas', pos: 'L', rating: 67, age: 26, nat: 'BRA', role: 'Normal', chars: ['Vel'] },
      { name: 'Nenê', pos: 'M', rating: 73, age: 42, nat: 'BRA', role: 'Ofensivo', chars: ['Pas', 'Chu'] },
      { name: 'Jadson', pos: 'M', rating: 66, age: 24, nat: 'BRA', role: 'Volante', chars: ['Mar'] },
      { name: 'Lucas Barbosa', pos: 'A', rating: 68, age: 23, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
      { name: 'Erick Farias', pos: 'A', rating: 67, age: 25, nat: 'BRA', role: 'Ofensivo', chars: ['Vel'] },
    ],
    fill: { avgRating: 54, count: 17 }
  },
  vitoria: {
    stars: [
      { name: 'Lucas Arcanjo', pos: 'G', rating: 72, age: 24, nat: 'BRA', role: 'Defensivo', chars: ['Ref'] },
      { name: 'Wagner Leonardo', pos: 'Z', rating: 70, age: 25, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Camutanga', pos: 'Z', rating: 67, age: 27, nat: 'BRA', role: 'Defensivo', chars: ['Mar'] },
      { name: 'Willean Lepo', pos: 'L', rating: 67, age: 27, nat: 'BRA', role: 'Normal', chars: ['Vel', 'Mar'] },
      { name: 'Machado', pos: 'M', rating: 70, age: 27, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Léo Naldi', pos: 'M', rating: 67, age: 25, nat: 'BRA', role: 'Normal', chars: ['Pas'] },
      { name: 'Matheuzinho', pos: 'A', rating: 70, age: 24, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
      { name: 'Alerrandro', pos: 'A', rating: 71, age: 22, nat: 'BRA', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
    ],
    fill: { avgRating: 53, count: 17 }
  },
  'athletico-paranaense': {
    stars: [
      { name: 'Bento', pos: 'G', rating: 76, age: 25, nat: 'BRA', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Thiago Heleno', pos: 'Z', rating: 73, age: 35, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Kaique Rocha', pos: 'Z', rating: 71, age: 23, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Vel'] },
      { name: 'Madson', pos: 'L', rating: 70, age: 29, nat: 'BRA', role: 'Normal', chars: ['Vel', 'Mar'] },
      { name: 'Fernandinho', pos: 'M', rating: 74, age: 39, nat: 'BRA', role: 'Volante', chars: ['Pas', 'Mar'] },
      { name: 'Christian', pos: 'M', rating: 72, age: 25, nat: 'BRA', role: 'Ofensivo', chars: ['Dri', 'Pas'] },
      { name: 'Zapelli', pos: 'M', rating: 72, age: 23, nat: 'ARG', role: 'Ofensivo', chars: ['Dri', 'Vel'] },
      { name: 'Canobbio', pos: 'A', rating: 74, age: 26, nat: 'URU', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
      { name: 'Pablo', pos: 'A', rating: 72, age: 32, nat: 'BRA', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
    ],
    fill: { avgRating: 56, count: 16 }
  },
  bragantino: {
    stars: [
      { name: 'Cleiton', pos: 'G', rating: 74, age: 26, nat: 'BRA', role: 'Defensivo', chars: ['Ref', 'Pos'] },
      { name: 'Pedro Henrique', pos: 'Z', rating: 72, age: 28, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Eduardo Santos', pos: 'Z', rating: 70, age: 27, nat: 'BRA', role: 'Defensivo', chars: ['Mar'] },
      { name: 'Nathan', pos: 'L', rating: 69, age: 27, nat: 'BRA', role: 'Normal', chars: ['Vel', 'Mar'] },
      { name: 'Eric Ramires', pos: 'M', rating: 73, age: 25, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Matheus Fernandes', pos: 'M', rating: 71, age: 26, nat: 'BRA', role: 'Normal', chars: ['Pas', 'Dri'] },
      { name: 'Lincoln', pos: 'M', rating: 72, age: 24, nat: 'BRA', role: 'Ofensivo', chars: ['Dri', 'Vel'] },
      { name: 'Helinho', pos: 'A', rating: 72, age: 24, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
      { name: 'Eduardo Sasha', pos: 'A', rating: 72, age: 32, nat: 'BRA', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
    ],
    fill: { avgRating: 55, count: 16 }
  },
  cuiaba: {
    stars: [
      { name: 'Walter', pos: 'G', rating: 70, age: 31, nat: 'BRA', role: 'Defensivo', chars: ['Ref'] },
      { name: 'Marllon', pos: 'Z', rating: 67, age: 28, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Alan Empereur', pos: 'Z', rating: 68, age: 30, nat: 'BRA', role: 'Defensivo', chars: ['Mar'] },
      { name: 'Raylan', pos: 'L', rating: 65, age: 24, nat: 'BRA', role: 'Normal', chars: ['Vel'] },
      { name: 'Lucas Mineiro', pos: 'M', rating: 68, age: 28, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Denilson', pos: 'M', rating: 67, age: 27, nat: 'BRA', role: 'Normal', chars: ['Pas'] },
      { name: 'Isidro Pitta', pos: 'A', rating: 70, age: 25, nat: 'PAR', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
      { name: 'Derik Lacerda', pos: 'A', rating: 67, age: 26, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Fin'] },
    ],
    fill: { avgRating: 52, count: 17 }
  },
  criciuma: {
    stars: [
      { name: 'Gustavo', pos: 'G', rating: 70, age: 28, nat: 'BRA', role: 'Defensivo', chars: ['Ref'] },
      { name: 'Rodrigo', pos: 'Z', rating: 68, age: 29, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Tobias Figueiredo', pos: 'Z', rating: 69, age: 30, nat: 'POR', role: 'Defensivo', chars: ['Mar', 'Pas'] },
      { name: 'Claudinho', pos: 'L', rating: 66, age: 25, nat: 'BRA', role: 'Normal', chars: ['Vel'] },
      { name: 'Barreto', pos: 'M', rating: 69, age: 28, nat: 'BRA', role: 'Volante', chars: ['Mar', 'Pas'] },
      { name: 'Marcelo Hermes', pos: 'M', rating: 67, age: 27, nat: 'BRA', role: 'Normal', chars: ['Pas', 'Dri'] },
      { name: 'Bolasie', pos: 'A', rating: 70, age: 35, nat: 'COD', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
      { name: 'Arthur Caíke', pos: 'A', rating: 67, age: 27, nat: 'BRA', role: 'Ofensivo', chars: ['Fin', 'Vel'] },
    ],
    fill: { avgRating: 52, count: 17 }
  },
  'atletico-goianiense': {
    stars: [
      { name: 'Ronaldo', pos: 'G', rating: 68, age: 30, nat: 'BRA', role: 'Defensivo', chars: ['Ref'] },
      { name: 'Adriano Martins', pos: 'Z', rating: 65, age: 27, nat: 'BRA', role: 'Defensivo', chars: ['Mar'] },
      { name: 'Alix Vinícius', pos: 'Z', rating: 64, age: 26, nat: 'BRA', role: 'Defensivo', chars: ['Mar', 'Cab'] },
      { name: 'Maguinho', pos: 'L', rating: 65, age: 28, nat: 'BRA', role: 'Normal', chars: ['Vel', 'Mar'] },
      { name: 'Rhaldney', pos: 'M', rating: 66, age: 24, nat: 'BRA', role: 'Volante', chars: ['Mar'] },
      { name: 'Shaylon', pos: 'M', rating: 66, age: 27, nat: 'BRA', role: 'Ofensivo', chars: ['Dri', 'Pas'] },
      { name: 'Luiz Fernando', pos: 'A', rating: 67, age: 27, nat: 'BRA', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
      { name: 'Emiliano Rodríguez', pos: 'A', rating: 66, age: 25, nat: 'URU', role: 'Ofensivo', chars: ['Fin'] },
    ],
    fill: { avgRating: 50, count: 17 }
  }
};

// Fill positions for generated players
const fillPositions = [
  { pos: 'G', role: 'Defensivo', chars: ['Ref'] },
  { pos: 'G', role: 'Defensivo', chars: ['Ref', 'Pos'] },
  { pos: 'Z', role: 'Defensivo', chars: ['Mar', 'Cab'] },
  { pos: 'Z', role: 'Defensivo', chars: ['Mar'] },
  { pos: 'L', role: 'Normal', chars: ['Vel', 'Mar'] },
  { pos: 'L', role: 'Ofensivo', chars: ['Vel', 'Pas'] },
  { pos: 'L', role: 'Normal', chars: ['Mar'] },
  { pos: 'M', role: 'Volante', chars: ['Mar', 'Pas'] },
  { pos: 'M', role: 'Normal', chars: ['Pas', 'Dri'] },
  { pos: 'M', role: 'Normal', chars: ['Pas'] },
  { pos: 'M', role: 'Ofensivo', chars: ['Dri', 'Pas'] },
  { pos: 'M', role: 'Ofensivo', chars: ['Chu', 'Pas'] },
  { pos: 'M', role: 'Volante', chars: ['Mar'] },
  { pos: 'A', role: 'Ofensivo', chars: ['Fin', 'Vel'] },
  { pos: 'A', role: 'Ofensivo', chars: ['Vel', 'Dri'] },
  { pos: 'A', role: 'Ofensivo', chars: ['Fin', 'Cab'] },
  { pos: 'A', role: 'Ofensivo', chars: ['Dri'] },
];

// Common Brazilian names for fill players
const firstNames = [
  'Lucas', 'Gabriel', 'Matheus', 'Rafael', 'Felipe', 'Gustavo', 'Bruno', 'Pedro',
  'João', 'Vinícius', 'Henrique', 'Daniel', 'Leonardo', 'André', 'Marcos', 'Diego',
  'Thiago', 'Carlos', 'Eduardo', 'Rodrigo', 'Victor', 'Igor', 'Danilo', 'Murilo',
  'Caio', 'Luiz', 'Renan', 'Luan', 'Kayky', 'Erick', 'Nathan', 'Rômulo',
  'Alex', 'Arthur', 'Breno', 'Wesley', 'Michel', 'Ruan', 'Yago', 'Hugo',
  'Patrick', 'Samuel', 'Willian', 'Anderson', 'Fernando', 'Marcelo', 'Paulo', 'Ricardo'
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Ferreira', 'Costa', 'Pereira',
  'Rodrigues', 'Almeida', 'Nascimento', 'Araújo', 'Barbosa', 'Ribeiro', 'Martins',
  'Gomes', 'Carvalho', 'Nunes', 'Fernandes', 'Vieira', 'Moreira', 'Andrade', 'Mendes',
  'Teixeira', 'Lopes', 'Moura', 'Freitas', 'Cardoso', 'Correia', 'Dias', 'Batista',
  'Campos', 'Monteiro', 'Pinto', 'Reis', 'Rocha', 'Duarte', 'Castro', 'Cruz'
];

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFillPlayers(teamId, count, avgRating) {
  const players = [];
  const usedNames = new Set();

  for (let i = 0; i < count; i++) {
    const template = fillPositions[i % fillPositions.length];
    let name;
    do {
      const first = firstNames[randInt(0, firstNames.length - 1)];
      const last = lastNames[randInt(0, lastNames.length - 1)];
      name = `${first} ${last}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const ratingVariance = randInt(-8, 5);
    const rating = Math.max(40, Math.min(75, avgRating + ratingVariance));
    const age = randInt(19, 34);
    const salary = Math.round((rating * rating * 50) + randInt(10000, 50000));

    players.push({
      id: `${slugify(name)}-${teamId}`,
      name,
      teamId,
      position: template.pos,
      rating,
      age,
      nationality: 'BRA',
      salary,
      passRating: Math.max(30, rating + randInt(-15, 10)),
      energy: 100,
      role: template.role,
      characteristics: template.chars,
      goals: 0,
      yellowCards: 0,
      redCards: 0,
      matchesPlayed: 0
    });
  }
  return players;
}

// Generate all players
const allPlayers = [];

for (const [teamId, roster] of Object.entries(teamRosters)) {
  // Add star/named players
  for (const p of roster.stars) {
    const salary = Math.round((p.rating * p.rating * 60) + randInt(50000, 200000));
    allPlayers.push({
      id: `${slugify(p.name)}-${teamId}`,
      name: p.name,
      teamId,
      position: p.pos,
      rating: p.rating,
      age: p.age,
      nationality: p.nat,
      salary,
      passRating: Math.max(30, p.rating + randInt(-10, 10)),
      energy: 100,
      role: p.role,
      characteristics: p.chars,
      goals: 0,
      yellowCards: 0,
      redCards: 0,
      matchesPlayed: 0
    });
  }

  // Add fill players
  const fillPlayers = generateFillPlayers(teamId, roster.fill.count, roster.fill.avgRating);
  allPlayers.push(...fillPlayers);
}

// Write output
const outputPath = path.join(__dirname, '..', 'public', 'data', 'leagues', 'serie_a', 'players.json');
fs.writeFileSync(outputPath, JSON.stringify(allPlayers, null, 2));
console.log(`Generated ${allPlayers.length} players for ${Object.keys(teamRosters).length} teams`);
console.log(`Output: ${outputPath}`);

// Verify distribution
const teamCounts = {};
for (const p of allPlayers) {
  teamCounts[p.teamId] = (teamCounts[p.teamId] || 0) + 1;
}
console.log('\nPlayers per team:');
for (const [team, count] of Object.entries(teamCounts).sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`  ${team}: ${count}`);
}
