import React, { useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import _ from 'lodash'
import { Navigate, useParams } from 'react-router-dom'
import { Edit, Delete } from '@mui/icons-material'

import CreateFAB from '../lists/CreateFAB'
import { handoffSummary } from './util'
import DetailsPage from '../details/DetailsPage'
import RotationEditDialog from './RotationEditDialog'
import RotationDeleteDialog from './RotationDeleteDialog'
import RotationUserList from './RotationUserList'
import RotationAddUserDialog from './RotationAddUserDialog'
import { QuerySetFavoriteButton } from '../util/QuerySetFavoriteButton'
import Spinner from '../loading/components/Spinner'
import { ObjectNotFound, GenericError } from '../error-pages'
import { RotationAvatar } from '../util/avatars'
import { useSessionInfo } from '../util/RequireConfig'

const query = gql`
  fragment RotationTitleQuery on Rotation {
    id
    name
    description
  }

  query rotationDetails($id: ID!) {
    rotation(id: $id) {
      ...RotationTitleQuery

      activeUserIndex
      userIDs
      type
      shiftLength
      timeZone
      start
    }
  }
`

export default function RotationDetails() {
  const { rotationID } = useParams()
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const {
    userID: _1,
    isAdmin,
    ready: _2,
  } = useSessionInfo()

  const {
    data: _data,
    loading,
    error,
  } = useQuery(query, {
    variables: { id: rotationID },
    returnPartialData: true,
  })

  const data = _.get(_data, 'rotation', null)

  if (loading && !data?.name) return <Spinner />
  if (error) return <GenericError error={error.message} />

  if (!data)
    return showDelete ? (
      <Navigate to='/rotations' />
    ) : (
      <ObjectNotFound type='rotation' />
    )

  return (
    <React.Fragment>
      <CreateFAB title='Add User' onClick={() => setShowAddUser(true)} />
      {showAddUser && (
        <RotationAddUserDialog
          rotationID={rotationID}
          userIDs={data.userIDs}
          onClose={() => setShowAddUser(false)}
        />
      )}
      {showEdit && (
        <RotationEditDialog
          rotationID={rotationID}
          onClose={() => setShowEdit(false)}
        />
      )}
      {showDelete && (
        <RotationDeleteDialog
          rotationID={rotationID}
          onClose={() => setShowDelete(false)}
        />
      )}
      <DetailsPage
        avatar={<RotationAvatar />}
        title={data.name}
        subheader={handoffSummary(data)}
        details={data.description}
        pageContent={<RotationUserList rotationID={rotationID} />}
        secondaryActions={
          isAdmin
            ? [
              {
                label: 'Edit',
                icon: <Edit />,
                handleOnClick: () => setShowEdit(true),
              },
              {
                label: 'Delete',
                icon: <Delete />,
                handleOnClick: () => setShowDelete(true),
              },
              <QuerySetFavoriteButton
                key='secondary-action-favorite'
                id={rotationID}
                type='rotation'
              />,
            ]
            : [
              <QuerySetFavoriteButton
                key='secondary-action-favorite'
                id={rotationID}
                type='rotation'
              />,
            ]
        }
      />
    </React.Fragment>
  )
}
