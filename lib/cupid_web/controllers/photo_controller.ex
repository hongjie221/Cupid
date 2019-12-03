defmodule CupidWeb.PhotoController do
  use CupidWeb, :controller

  alias Cupid.Photos
  alias Cupid.Photos.Photo

  action_fallback CupidWeb.FallbackController

  plug CupidWeb.Plugs.RequireAuth when action in [:index, :create, :update, :delete, :match_photo]

  def index(conn, _params) do
    photos = Photos.list_user_photos(conn.assigns[:current_user].id)

    photos =
      Enum.map(photos, fn p ->
        %{
          id: p.id,
          data: File.read!(Path.join(Photo.photo_upload_dir(p.uuid), p.filename)),
          desc: p.desc
        }
      end)


    render(conn, "index.json", photos: photos)
  end

  def create(conn, %{"photo" => photo_params}) do
    # add current_user in photo parameters
    photo_params = Map.put(photo_params, "user_id", conn.assigns[:current_user].id)


    with {:ok, %Photo{} = photo} <- Photos.create_photo(photo_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.photo_path(conn, :show, photo))
      |> render("show.json", photo: photo)
    end
  end

  def show(conn, %{"id" => id}) do
    photo = Photos.get_photo!(id)
    render(conn, "show.json", photo: photo)
  end

  def update(conn, %{"id" => id, "photo" => photo_params}) do
    photo = Photos.get_photo!(id)

    with {:ok, %Photo{} = photo} <- Photos.update_photo(photo, photo_params) do
      render(conn, "show.json", photo: photo)
    end
  end

  def delete(conn, %{"id" => id}) do
    photo = Photos.get_photo!(id)

    with {:ok, %Photo{}} <- Photos.delete_photo(photo) do
      send_resp(conn, :no_content, "")
    end
  end

  def match_photo(conn, %{"id" => id}) do
    photos = Photos.list_user_photos(id)
    photos =
      Enum.map(photos, fn p ->
        %{
          id: p.id,
          data: File.read!(Path.join(Photo.photo_upload_dir(p.uuid), p.filename)),
          desc: p.desc
        }
      end)
    render(conn, "index.json", photos: photos)

  end
end
