defmodule CupidWeb.MatchView do
  use CupidWeb, :view
  alias CupidWeb.MatchView
  alias CupidWeb.UserView

  def render("index.json", %{matches: matches}) do
    %{data: render_many(matches, MatchView, "match.json")}
  end

  def render("show.json", %{match: match}) do
    %{data: render_one(match, MatchView, "match.json")}
  end

  def render("match.json", %{match: match}) do

    %{id: match.id, name: match.name}
  #   %{
  #     id: match.id,
  #     user1: UserView.render("user.json", %{user: match.users_1}),
  #     user2: UserView.render("user.json", %{user: match.users_2}),
  # }
  end
end
