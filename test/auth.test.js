import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../src/app.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dados = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'data/testData.json'),
    'utf-8'
  )
);

describe('POST /api/auth/login', () => {
  after(async () => {
    await mongoose.connection.close();
  });

  it('deve retornar 200 e um token quando o admin informar e-mail e senha corretos', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: dados.admin.email, senha: dados.admin.senha});

    expect(resposta.status).to.equal(200);
    expect(resposta.body).to.have.property('token');
  });

  it('deve retornar 401 quando a senha informada for inválida', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: dados.admin.email, senha: dados.admin.senhaInvalida});

    expect(resposta.status).to.equal(401);
    expect(resposta.body.error).to.equal('E-mail ou senha inválidos.');
  });
});
