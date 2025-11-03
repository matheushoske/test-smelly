const { UserService } = require('../src/userService');

describe('UserService - Suíte de Testes Limpa', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('deve criar um usuário com todos os campos obrigatórios', () => {
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      const usuarioCriado = userService.createUser(nome, email, idade);

      expect(usuarioCriado.id).toBeDefined();
      expect(usuarioCriado.nome).toBe(nome);
      expect(usuarioCriado.email).toBe(email);
      expect(usuarioCriado.idade).toBe(idade);
      expect(usuarioCriado.isAdmin).toBe(false);
      expect(usuarioCriado.status).toBe('ativo');
      expect(usuarioCriado.createdAt).toBeInstanceOf(Date);
    });

    test('deve criar um usuário com permissões de administrador quando isAdmin for true', () => {
      const nome = 'Admin User';
      const email = 'admin@teste.com';
      const idade = 30;

      const usuarioCriado = userService.createUser(nome, email, idade, true);

      expect(usuarioCriado.isAdmin).toBe(true);
    });

    test('deve lançar erro ao tentar criar usuário sem nome', () => {
      const email = 'teste@teste.com';
      const idade = 25;

      expect(() => {
        userService.createUser(null, email, idade);
      }).toThrow('Nome, email e idade são obrigatórios.');
    });

    test('deve lançar erro ao tentar criar usuário sem email', () => {
      const nome = 'Test User';
      const idade = 25;

      expect(() => {
        userService.createUser(nome, null, idade);
      }).toThrow('Nome, email e idade são obrigatórios.');
    });

    test('deve lançar erro ao tentar criar usuário sem idade', () => {
      const nome = 'Test User';
      const email = 'teste@teste.com';

      expect(() => {
        userService.createUser(nome, email, null);
      }).toThrow('Nome, email e idade são obrigatórios.');
    });

    test('deve lançar erro ao tentar criar usuário menor de idade', () => {
      const nome = 'Menor';
      const email = 'menor@email.com';
      const idade = 17;

      expect(() => {
        userService.createUser(nome, email, idade);
      }).toThrow('O usuário deve ser maior de idade.');
    });
  });

  describe('getUserById', () => {
    test('deve retornar usuário existente quando fornecido um ID válido', () => {
      const usuarioCriado = userService.createUser('Fulano', 'fulano@teste.com', 25);

      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      expect(usuarioBuscado).not.toBeNull();
      expect(usuarioBuscado.nome).toBe('Fulano');
      expect(usuarioBuscado.email).toBe('fulano@teste.com');
      expect(usuarioBuscado.idade).toBe(25);
    });

    test('deve retornar null quando fornecido um ID inexistente', () => {
      const idInexistente = 'id_que_nao_existe';

      const usuarioBuscado = userService.getUserById(idInexistente);

      expect(usuarioBuscado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('deve desativar usuário comum com sucesso', () => {
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      const resultado = userService.deactivateUser(usuarioComum.id);

      expect(resultado).toBe(true);
      const usuarioAtualizado = userService.getUserById(usuarioComum.id);
      expect(usuarioAtualizado.status).toBe('inativo');
    });

    test('deve retornar false ao tentar desativar usuário administrador', () => {
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      const resultado = userService.deactivateUser(usuarioAdmin.id);

      expect(resultado).toBe(false);
      const usuarioAtualizado = userService.getUserById(usuarioAdmin.id);
      expect(usuarioAtualizado.status).toBe('ativo');
    });

    test('deve retornar false ao tentar desativar usuário inexistente', () => {
      const idInexistente = 'id_que_nao_existe';

      const resultado = userService.deactivateUser(idInexistente);

      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('deve gerar relatório vazio quando não há usuários cadastrados', () => {
      const relatorio = userService.generateUserReport();

      expect(relatorio).toBe('--- Relatório de Usuários ---\nNenhum usuário cadastrado.');
    });

    test('deve gerar relatório contendo informações dos usuários cadastrados', () => {
      const usuario1 = userService.createUser('Alice', 'alice@email.com', 28);
      const usuario2 = userService.createUser('Bob', 'bob@email.com', 32);

      const relatorio = userService.generateUserReport();

      expect(relatorio).toContain('--- Relatório de Usuários ---');
      expect(relatorio).toContain(usuario1.id);
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain('ativo');
      expect(relatorio).toContain(usuario2.id);
      expect(relatorio).toContain('Bob');
    });

    test('deve incluir status do usuário no relatório', () => {
      const usuario = userService.createUser('Teste', 'teste@email.com', 25);
      userService.deactivateUser(usuario.id);

      const relatorio = userService.generateUserReport();

      expect(relatorio).toContain('inativo');
    });
  });
});

