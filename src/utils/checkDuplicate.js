import { duplicateCheckRequest } from "../../redux/slices/clientSlice";

export async function checkDuplicate(dispatch, currSelectedGroupId, column_id, row_value, client_id) {
  if (!row_value) return { isDuplicate: false, ok: true };

  return new Promise((resolve) => {
    dispatch(
      duplicateCheckRequest({
        request: {
          client_group_id: currSelectedGroupId,
          column_id,
          row_value,
          client_id
        },
        cb: (err, result) => {
          if (err) {
      
            // match previous shape { isDuplicate: false, ok: false }
            resolve({ isDuplicate: false, ok: false, error: err });
          } else {
            resolve({ isDuplicate: !!result.data.isDuplicate, ok: true });
          }
        },
      })
    );
  });
}


