defmodule CupidWeb.UserController do
  use CupidWeb, :controller

  alias Cupid.Users
  alias Cupid.Users.User
  alias Cupid.GeocodeApi
  alias Cupid.Matches

  action_fallback CupidWeb.FallbackController

  plug CupidWeb.Plugs.RequireAuth
    when action in [:friends]

  def index(conn, _params) do
    users = Users.list_users()
    render(conn, "index.json", users: users)
  end

  def create(conn, %{"user" => user_params}) do
    with {:ok, %User{} = user} <- Users.create_user(user_params) do
      token = Phoenix.Token.sign(conn, "session", user.id)
      resp = %{token: token, user_id: user.id, user_name: user.name}
      conn
      |> put_resp_header("content-type", "application/json; charset=UTF-8")
      |> send_resp(:created, Jason.encode!(resp))
    end
  end

  def friends(conn, _params) do
    user = conn.assigns[:current_user]
    friends = Matches.list_friends(user.id)
    conn
    |> put_resp_header("content-type", "application/json; charset=UTF-8")
    |> send_resp(:ok, Jason.encode!(friends))
  end

  def show(conn, %{"id" => id}) do
    user = Users.get_user!(id)
    render(conn, "show.json", user: user)
  end

  def update(conn, %{"id" => id, "user" => user_params}) do
    user = Users.get_user!(id)
    with {:ok, %User{} = user} <- Users.update_user_desc_by_id(id, user_params) do
      render(conn, "show.json", user: user)
    end
  end

  def update(conn, %{"id" => id, "latitude" => lan, "longitude" => lon}) do

      if is_float(lan) do

      end

      # get the location based on Lat and Lon through Google Geocode api
      addr = GeocodeApi.getLocation(%{:latitude => lan, :longitude => lon})

      with {:ok, %User{} = user} <- Users.update_user_lan_lon_by_id(id, lan, lon, addr) do

        render(conn, "show.json", user: user)
      end
  end

  def delete(conn, %{"id" => id}) do
    user = Users.get_user!(id)

    with {:ok, %User{}} <- Users.delete_user(user) do
      send_resp(conn, :no_content, "")
    end
  end
end
