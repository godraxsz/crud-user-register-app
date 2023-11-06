import axios from 'axios';
import React, { useState, useEffect, useReducer, ChangeEvent } from 'react';
import { Segment, Header, Icon, Table, Button, Modal, Form, Input, Menu } from 'semantic-ui-react';
import { format } from 'date-fns';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';

import { formatName, formatPhone, validateEmail, validateName, validatePhone } from './util/StringFunctions';
import { ReducerModalAction, ReducerModalState, User } from './util/Interfaces';
import './App.css';
import ptBR from 'date-fns/locale/pt-BR';

function exampleReducer(state: ReducerModalState, action: ReducerModalAction) {
  switch (action.type) {
    case 'OPEN_MODAL':
      return { open: true, size: action.size, dimmer: action.dimmer, userToRemove: action.userToRemove, userToEdit: action.userToEdit, userToCreate: action.userToCreate }
    case 'CLOSE_MODAL':
      return { open: false }
    default:
      throw new Error()
  }
}

function App() {

  const [state, dispatch] = useReducer(exampleReducer, { open: false });
  const [searchInput, setSearchInput] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortedUsers, setSortedUsers] = useState<User[]>([]);
  const [currentTimeRange, setCurrentTimeRange] = useState<string[]>([]);
  const [commonError, setCommonError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const { open, size, dimmer, userToRemove, userToEdit, userToCreate } = state;

  useEffect(() => {
    currentTimeRange && currentTimeRange.length > 0 ? handleTimePicker(searchInput) : updateUsersList(searchInput);
  }, [searchInput]);

  const clearErrors = (mode: string) => {
    switch (mode) {
      case 'common': setCommonError(null); break;
      case 'name': setNameError(null); break;
      case 'email': setEmailError(null); break;
      case 'phone': setPhoneError(null); break;
      case 'all':
      default: setCommonError(null); setNameError(null); setEmailError(null); setPhoneError(null); break;
    }
  }

  const updateUsersList = (search?: string) => {
    axios
      .get(`http://localhost:8000/api/users/${search ?? ''}`)
      .then((res) => {
        const users = res.data?.users || [];
        const sortedList = users.sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();

          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });

        setSortedUsers([...sortedList]);
      })
      .catch((error) => {
        console.log(error);
        switch (error.response?.data?.errorId) {
          case 'user_not_found':
          default:
            setSortedUsers([]);
            break;
        }
      });
  };

  const handleCreateUser = () => {
    if (userToCreate) {
      axios.post(`http://localhost:8000/api/users/`, userToCreate)
        .then((res) => {
          updateUsersList(searchInput);
          dispatch({ type: 'CLOSE_MODAL' });
        })
        .catch((error) => {
          switch (error.response?.data?.errorId) {
            case 'email_already_registered': setEmailError(error.response?.data?.msg); break;
            case 'name_already_registered': setNameError(error.response?.data?.msg); break;
            case 'phone_already_registered': setPhoneError(error.response?.data?.msg); break;
            default: setCommonError(error.response?.data?.msg ?? 'Erro desconhecido.'); break;
          }
          console.log(error.response?.data?.msg ?? 'Erro desconhecido.');
        });
    }
  };

  const handleUpdateUser = () => {
    if (userToEdit && userToEdit.id) {
      axios.put(`http://localhost:8000/api/users/${userToEdit.id}`, userToEdit)
        .then((res) => {
          updateUsersList(searchInput);
          dispatch({ type: 'CLOSE_MODAL' });
        })
        .catch((error) => {
          switch (error.response?.data?.errorId) {
            case 'email_already_registered': setEmailError(error.response?.data?.msg); break;
            case 'name_already_registered': setNameError(error.response?.data?.msg); break;
            case 'phone_already_registered': setPhoneError(error.response?.data?.msg); break;
            case 'id_not_registered':
            case 'no_data_modified':
            default: setCommonError(error.response?.data?.msg ?? 'Erro desconhecido.'); break;
          }
          console.log(error.response?.data?.msg ?? 'Erro desconhecido.');
        });
    }
  };

  const handleRemoveUser = () => {
    if (userToRemove) {
      axios.delete(`http://localhost:8000/api/users/${userToRemove.id}`)
        .then(() => {
          updateUsersList(searchInput);
          dispatch({ type: 'CLOSE_MODAL' });
        })
        .catch(error => {
          switch (error.response?.data?.errorId) {
            case 'id_not_registered':
            default:
              setCommonError(error.response?.data?.msg ?? 'Erro desconhecido.');
              updateUsersList(searchInput);
              dispatch({ type: 'CLOSE_MODAL' });
              break;
          }
          console.log(error.response?.data?.msg ?? 'Erro desconhecido.');
        });
    }
  };

  const handleTimePicker = (search?: string) => {
    const buildApiUrl = (timeRanges: string[] | null, search: string | undefined) => {
      const baseUrl = 'http://localhost:8000/api/users';

      if (timeRanges && timeRanges.length > 0) {
        const endpoint = timeRanges.length > 1 ? `${timeRanges[0]}+${timeRanges[1]}/${search ?? ''}` : `${timeRanges[0]}/${search ?? ''}`;
        return `${baseUrl}/date/${endpoint}`;
      }

      return `${baseUrl}/${search ?? ''}`;
    };

    const apiUrl = buildApiUrl(currentTimeRange, search);

    axios
      .get(apiUrl)
      .then((res) => {
        const users = res.data?.users || [];
        const sortedList = users.sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();

          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });

        setSortedUsers([...sortedList]);
      })
      .catch((error) => {
        console.error(error);
        const errorId = error.response?.data?.errorId;
        switch (errorId) {
          case 'user_not_found':
          default:
            setSortedUsers([]);
            break;
        }
      });
  };

  const handleHeaderClick = () => {
    const sortedList = [...sortedUsers];

    sortedList.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return sortDirection === 'asc' ? dateB - dateA : dateA - dateB;
    });

    setSortedUsers([...sortedList]); // Cria um novo array antes de atualizar o estado
    setSortDirection((prevSortDirection) => (prevSortDirection === 'asc' ? 'desc' : 'asc'));
  };

  const handleSemanticDataPicker = (event: any, data: any) => {
    if (data.value) {
      const formattedStartDate = format(data.value[0], 'dd-MM-yyyy', { locale: ptBR });
      const formattedEndDate = data.value[1] ? format(data.value[1], 'dd-MM-yyyy', { locale: ptBR }) : undefined;
      const formattedTimeRange = formattedEndDate ? [formattedStartDate, formattedEndDate] : [formattedStartDate];

      setCurrentTimeRange(formattedTimeRange);
    } else {
      setCurrentTimeRange([]);
    }
  };

  useEffect(() => {
    console.log('mudou');
    handleTimePicker(searchInput);
  }, [currentTimeRange]);

  return (

    <div className="App">

      <Modal
        size="small"
        dimmer="blurring"
        open={open && !!userToCreate}
        onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
      >
        <Modal.Header>Novo Usuário</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field
              type="text"
              placeholder="Ex: Fulano de Tal"
              label="Nome"
              control={Input}
              maxLength={50}
              value={formatName(userToCreate?.name) || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                dispatch({ type: 'OPEN_MODAL', userToCreate: { ...userToCreate, name: e.target.value } });
                clearErrors('name');
              }}
              error={userToCreate?.name !== '' ? (validateName(userToCreate?.name) ? (nameError ? { content: nameError, pointing: 'below' } : null) : { content: 'Nome inválido.', pointing: 'below' }) : null}
            />
            <Form.Field
              type="email"
              placeholder="Ex: email@email.com"
              label="Email"
              control={Input}
              maxLength={75}
              value={userToCreate?.email || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                dispatch({ type: 'OPEN_MODAL', userToCreate: { ...userToCreate, email: e.target.value } });
                clearErrors('email');
              }}
              error={userToCreate?.email !== '' ? (validateEmail(userToCreate?.email) ? (emailError ? { content: emailError, pointing: 'below' } : null) : { content: 'Endereço de e-mail inválido.', pointing: 'below' }) : null}
            />
            <Form.Field
              type="tel"
              placeholder="Ex: 11912345678"
              label="Telefone (DDD + Número)"
              control={Input}
              maxLength={11}
              value={formatPhone(userToCreate?.phone) || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                dispatch({ type: 'OPEN_MODAL', userToCreate: { ...userToCreate, phone: e.target.value } });
                clearErrors('phone');
              }}
              error={userToCreate?.phone !== '' ? (validatePhone(userToCreate?.phone) ? (phoneError ? { content: phoneError, pointing: 'below' } : null) : { content: 'Número de telefone inválido.', pointing: 'below' }) : null}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => {
            dispatch({ type: 'CLOSE_MODAL' })
            clearErrors('all');
          }}>
            Cancelar
          </Button>
          <Button disabled={!validateEmail(userToCreate?.email) || !validatePhone(userToCreate?.phone) || !validateName(userToCreate?.name)} positive onClick={handleCreateUser}>
            Adicionar
          </Button>
        </Modal.Actions>
      </Modal>

      <Modal
        size={size}
        dimmer={dimmer}
        open={open && !!userToRemove}
        onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
      >
        <Modal.Header>Remover o usuário "{userToRemove?.name}"?</Modal.Header>
        <Modal.Content>
          Essa ação não poderá ser desfeita.
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => dispatch({ type: 'CLOSE_MODAL' })}>
            Cancelar
          </Button>
          <Button positive onClick={handleRemoveUser}>
            Confirmar
          </Button>
        </Modal.Actions>
      </Modal>

      <Modal
        size="small"
        dimmer="blurring"
        open={open && !!userToEdit}
        onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
      >
        <Modal.Header>Editar Usuário</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field
              type="text"
              placeholder="Ex: Fulano de Tal"
              label="Nome"
              control={Input}
              maxLength={50}
              value={formatName(userToEdit?.name) || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                dispatch({ type: 'OPEN_MODAL', userToEdit: { ...userToEdit, name: e.target.value } });
                clearErrors('name');
              }}
              error={validateName(userToEdit?.name) ? (nameError ? { content: nameError, pointing: 'below' } : null) : { content: 'Nome inválido.', pointing: 'below' }}
            />
            <Form.Field
              type="email"
              placeholder="Ex: email@email.com"
              label="Email"
              control={Input}
              maxLength={75}
              value={userToEdit?.email || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                dispatch({ type: 'OPEN_MODAL', userToEdit: { ...userToEdit, email: e.target.value } });
                clearErrors('email');
              }}
              error={validateEmail(userToEdit?.email) ? (emailError ? { content: emailError, pointing: 'below' } : null) : { content: 'Endereço de e-mail inválido.', pointing: 'below' }}
            />
            <Form.Field
              type="tel"
              placeholder="Ex: 11912345678"
              label="Telefone (DDD + Número)"
              control={Input}
              maxLength={11}
              value={formatPhone(userToEdit?.phone) || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                dispatch({ type: 'OPEN_MODAL', userToEdit: { ...userToEdit, phone: e.target.value } });
                clearErrors('phone');
              }}
              error={validatePhone(userToEdit?.phone) ? (phoneError ? { content: phoneError, pointing: 'below' } : null) : { content: 'Número de telefone inválido.', pointing: 'below' }}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => {
            dispatch({ type: 'CLOSE_MODAL' })
            clearErrors('all');
          }}>
            Cancelar
          </Button>
          <Button disabled={!validateEmail(userToEdit?.email) || !validatePhone(userToEdit?.phone) || !validateName(userToEdit?.name)} positive onClick={handleUpdateUser}>
            Confirmar
          </Button>
        </Modal.Actions>
      </Modal>

      <Segment>
        <Header as='h2' icon>
          <Icon name='settings' />
          Gerenciamento de Usuários
          <Header.Subheader>
            Criar, visualizar, editar e remover
          </Header.Subheader>
        </Header>
      </Segment>

      <Segment>

        <Menu stackable>
          <Menu.Item>
            <Input
              className='icon'
              icon='users'
              iconPosition='left'
              placeholder='Buscar usuários...'
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
            />
          </Menu.Item>
          <Menu.Item fluid={true}>
            <div className="timePicker">
              <SemanticDatepicker format='DD-MM-YYYY' iconPosition='left' locale="pt-BR" type="range"
                onChange={handleSemanticDataPicker}
              />
            </div>
          </Menu.Item>
          <Menu.Item position="right">
            <div>
              <Button size='mini' positive onClick={() => dispatch({ type: 'OPEN_MODAL', size: 'small', dimmer: 'blurring', userToCreate: { name: '', email: '', phone: '' } })}>
                <Icon name="plus" />
                Novo
              </Button>
            </div>
          </Menu.Item>
        </Menu>


        {(!sortedUsers || sortedUsers.length <= 0) && <h1>
          Nenhum usuário encontrado.
        </h1>}

        {sortedUsers && sortedUsers.length > 0 && <Table celled>

          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Nome</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Telefone</Table.HeaderCell>
              <Table.HeaderCell onClick={() => handleHeaderClick()} style={{ cursor: 'pointer' }}>{sortDirection === 'asc' && <Icon name="caret up" />}{sortDirection === 'desc' && <Icon name="caret down" />}Criado em</Table.HeaderCell>
              <Table.HeaderCell>Última Modificação</Table.HeaderCell>
              <Table.HeaderCell>Ações</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {sortedUsers && sortedUsers.map((user: User) => (
              <Table.Row key={user.id}>
                <Table.Cell>{user.id}</Table.Cell>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>{user.phone}</Table.Cell>
                <Table.Cell>{user.createdAt}</Table.Cell>
                <Table.Cell>{user.updatedAt}</Table.Cell>
                <Table.Cell>
                  <Button size='mini' secondary onClick={() => dispatch({ type: 'OPEN_MODAL', size: 'small', dimmer: 'blurring', userToEdit: user })}><Icon name='wrench' />Editar</Button>
                  <Button size='mini' negative onClick={() => dispatch({ type: 'OPEN_MODAL', size: 'small', dimmer: 'blurring', userToRemove: user })}><Icon name='trash alternate' />Remover</Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>

        </Table>
        }

      </Segment>

    </div >

  );

}

export default App;
