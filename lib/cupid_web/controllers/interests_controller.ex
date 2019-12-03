defmodule CupidWeb.InterestsController do
  use CupidWeb, :controller

  alias Cupid.Interest
  alias Cupid.Interest.Interests
  alias Cupid.Users
  alias Cupid.Likes
  alias Cupid.Matches
  alias Cupid.GeocodeApi

  action_fallback CupidWeb.FallbackController
  plug CupidWeb.Plugs.RequireAuth when action in [:index, :create, :update, :delete, :browse]
  def index(conn, _params) do
    interest = Interest.list_interest_by_user_id(conn.assigns[:current_user].id)
    render(conn, "index.json", interest: interest)
  end

  def create(conn, %{"interests" => interests_params}) do
    tag_ids = Map.get(interests_params, "ids")
    interest_params = Enum.map(tag_ids, fn x -> %{tag_id: x} |> Map.put(:user_id, conn.assigns[:current_user].id) end)

    Enum.map(interest_params, fn x -> Interest.create_interests(x) end)
    render(conn, "success.json", interests: interest_params)

    #with {:ok, %Interests{} = interests} <- Interest.create_interests(interests_params) do
      #conn
      #|> put_status(:created)
      #|> put_resp_header("location", Routes.interests_path(conn, :show, interests))
      #|> render("show.json", interests: interests)
    #end
  end

  def show(conn, %{"id" => id}) do
    interests = Interest.get_interests!(id)
    render(conn, "show.json", interests: interests)
  end

  def update(conn, %{"id" => id, "interests" => interests_params}) do
    interests = Interest.get_interests!(id)

    with {:ok, %Interests{} = interests} <- Interest.update_interests(interests, interests_params) do
      render(conn, "show.json", interests: interests)
    end
  end

  def delete(conn, %{"id" => id}) do
    interests = Interest.get_interests!(id)

    with {:ok, %Interests{}} <- Interest.delete_interests(interests) do
      send_resp(conn, :no_content, "")
    end
  end

  @doc """
  Assemble recommended list here.
  recommended_users = users_same_interests ++ users_near_by -- users_liked -- users_matched
  """
  def browse(conn, %{"latitude" => lan, "longitude" => lon} = params) do

    # get the users who have two or more interests with current user
    current_user_id = conn.assigns[:current_user].id
    # get the gender of current user
    current_user_gender = conn.assigns[:current_user].gender
    # get the location based on Lat and Lon through Google Geocode api


    users_near_by = if lon !== 0 and lan !== 0 do
      addr = GeocodeApi.getLocation(%{:latitude => lan, :longitude => lon})
      # database update
      Users.update_user_lan_lon_by_id(current_user_id, lan, lon, addr)
      # get nearby user with opposite gender
      Users.get_user_by_radius(current_user_id) |> Enum.filter(fn id -> Users.get_user!(id).gender !== current_user_gender end)
    else
      []
    end

    users_same_interests = Interest.get_match_user_id(current_user_id)
    # filter the users with the same gender as current user
    users_same_interests = users_same_interests |> Enum.filter(fn id -> Users.get_user!(id).gender !== current_user_gender end)
    users_liked = Likes.get_likes_by_like_from_id(current_user_id) |> Enum.map(fn like -> like.like_to_id end)
    users_matched = Matches.list_user_matches(current_user_id)

    # use parentheses to ensure the right order
    recommended_users = (Enum.uniq(users_same_interests ++ users_near_by)  -- users_liked) -- users_matched |> Enum.map(fn x -> Users.get_user!(x)end)
    render(conn, "browse.json", match_user: recommended_users)
  end

end
