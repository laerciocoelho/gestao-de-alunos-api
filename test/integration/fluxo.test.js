import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { api, loginAsAdmin, loginAsAluno } from '../helpers/authHelper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dados = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/testData.json'), 'utf-8')
);

describe('Fluxo completo: admin cadastra aluno e aluno entrega trabalho', function () {
  this.timeout(15000);

  const sufixo = Date.now();
  const emailAluno = `${dados.novoAluno.prefixoEmail}.${sufixo}@${dados.novoAluno.dominioEmail}`;
  const matricula = `${dados.novoAluno.matriculaBase}${sufixo.toString().slice(-4)}`;

  let adminToken;
  let alunoToken;
  let alunoId;

  it('1. Deve logar como administrador', async () => {
    adminToken = await loginAsAdmin(dados.admin);
    expect(adminToken).to.be.a('string').and.not.empty;
  });

  it('2. Deve cadastrar um novo aluno (como admin)', async () => {
    const response = await api
      .post('/api/admin/alunos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: dados.novoAluno.nome,
        email: emailAluno,
        matricula,
        senha: dados.novoAluno.senha,
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    alunoId = response.body.id;
  });

  it('3. Deve matricular o aluno na disciplina de teste', async () => {
    const response = await api
      .post(`/api/admin/disciplinas/${dados.disciplinaId}/matriculas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ alunoId });

    expect(response.status).to.be.oneOf([200, 201]);
  });

  it('4. Deve logar como o aluno recém-cadastrado', async () => {
    const resultado = await loginAsAluno({ email: emailAluno, senha: dados.novoAluno.senha });
    alunoToken = resultado.token;
    expect(alunoToken).to.be.a('string').and.not.empty;
  });

  it('5. Deve registrar a entrega de um trabalho como aluno', async () => {
    const response = await api
      .post(`/api/alunos/${alunoId}/trabalhos`)
      .set('Authorization', `Bearer ${alunoToken}`)
      .send({
        disciplinaId: dados.disciplinaId,
        titulo: dados.trabalho.titulo,
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.include({ titulo: dados.trabalho.titulo });
  });
});