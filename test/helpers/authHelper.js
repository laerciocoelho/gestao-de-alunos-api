import request from 'supertest';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
export const api = request(BASE_URL);

export async function loginAsAdmin(credenciais) {
  const response = await api
    .post('/api/auth/login')
    .send({ email: credenciais.email, senha: credenciais.senha });

  if (response.status !== 200) {
    throw new Error(
      `Falha no login do administrador: ${response.status} - ${JSON.stringify(response.body)}`
    );
  }

  return response.body.token;
}

export async function loginAsAluno({ email, senha }) {
  const response = await api
    .post('/api/auth/login')
    .send({ email, senha });

  if (response.status !== 200) {
    throw new Error(
      `Falha no login do aluno: ${response.status} - ${JSON.stringify(response.body)}`
    );
  }

  return {
    token: response.body.token,
    alunoId: response.body.usuario?.id,
  };
}